import { BigInt, Address, ethereum, log } from "@graphprotocol/graph-ts";
import {
  GaugeController,
  CommitOwnership,
  ApplyOwnership,
  AddType,
  NewTypeWeight,
  NewGaugeWeight,
  VoteForGauge,
  NewGauge
} from "../generated/GaugeController/GaugeController";
import { Gauge, GaugeInfo, User, Vote } from "../generated/schema";

let ZERO_INT = BigInt.fromI32(0);
let gaugeControllerAddress = "0x3669C421b77340B2979d1A00a792CC2ee0FcE737";

export function getGauge(gaugeAddress: string): Gauge {
  let gauge = Gauge.load(gaugeAddress);
  if (gauge == null) {
    gauge = new Gauge(gaugeAddress);
    gauge.address = gaugeAddress;
    gauge.lastVote = ZERO_INT;
    gauge.currentWeight = ZERO_INT;
    gauge.futureWeight = ZERO_INT;
    gauge.save();
  }
  return gauge as Gauge;
}

export function getGaugeInfo(): GaugeInfo {
  let gaugeInfo = GaugeInfo.load("0");
  if (gaugeInfo == null) {
    gaugeInfo = new GaugeInfo("0");
    gaugeInfo.numGauges = 0;
    gaugeInfo.checkpoint = ZERO_INT;
    gaugeInfo.currentTotalWeight = ZERO_INT;
    gaugeInfo.futureTotalWeight = ZERO_INT;
    gaugeInfo.save();
  }
  return gaugeInfo as GaugeInfo;
}

export function getUser(userAddress: string): User {
  let user = User.load(userAddress);
  if (user == null) {
    user = new User(userAddress);
    user.address = userAddress;
    user.voteWeightUsed = ZERO_INT;
    user.votes = new Array<string>(0);
    user.save();
  }
  return user as User;
}

export function getVote(userAddress: string, gaugeAddress: string): Vote {
  let vote = Vote.load(userAddress + " --- " + gaugeAddress);
  if (vote == null) {
    vote = new Vote(userAddress + " --- " + gaugeAddress);
    vote.user = userAddress;
    vote.gauge = gaugeAddress;
    vote.weight = ZERO_INT;
    vote.time = ZERO_INT;
    vote.save();
  }
  return vote as Vote;
}

export function handleCommitOwnership(event: CommitOwnership): void {}

export function handleApplyOwnership(event: ApplyOwnership): void {}

export function handleAddType(event: AddType): void {}

export function handleNewTypeWeight(event: NewTypeWeight): void {}

export function handleNewGaugeWeight(event: NewGaugeWeight): void {}

export function handleVoteForGauge(event: VoteForGauge): void {
  // TODO
  // account for gauge type and changing weights because of it

  let userAddress = event.params.user.toHex();
  let gaugeAddress = event.params.gauge_addr.toHex();

  let user = getUser(userAddress);
  let vote = getVote(userAddress, gaugeAddress);
  let gauge = getGauge(gaugeAddress);
  let gaugeInfo = getGaugeInfo();

  // store previous vote weight
  let prevWeight = vote.weight;

  // update vote
  vote.weight = event.params.weight;
  vote.time = event.params.time;
  vote.save();

  // update user
  user.voteWeightUsed = user.voteWeightUsed.plus(vote.weight.minus(prevWeight));
  let votes = user.votes;
  votes.push(vote.id);
  user.votes = votes;
  user.save();

  let gaugeController = GaugeController.bind(event.address);

  // update total future weight
  let futureTotalWeight = gaugeController.try_points_total(
    gaugeInfo.checkpoint
  );
  gaugeInfo.futureTotalWeight = futureTotalWeight.reverted
    ? ZERO_INT
    : futureTotalWeight.value;
  gaugeInfo.save();

  // update gauge future weight
  let futureWeight = gaugeController.try_points_weight(
    event.params.gauge_addr,
    gaugeInfo.checkpoint
  );
  gauge.futureWeight = futureWeight.reverted
    ? ZERO_INT
    : futureWeight.value.bias;

  gauge.lastVote = event.params.time;
  gauge.save();
}

export function handleNewGauge(event: NewGauge): void {
  let gauge = getGauge(event.params.addr.toHex());
  gauge.save();

  // increment the number of gauges
  let gaugeInfo = getGaugeInfo();
  gaugeInfo.numGauges = gaugeInfo.numGauges + 1;
  gaugeInfo.save();
}

export function handleBlock(block: ethereum.Block): void {
  let gaugeInfo = getGaugeInfo();

  let blockTimestamp = block.timestamp;

  // past checkpoint
  if (blockTimestamp.gt(gaugeInfo.checkpoint)) {
    let gaugeController = GaugeController.bind(
      Address.fromString(gaugeControllerAddress)
    );

    // update checkpoint
    let time = gaugeController.try_time_total();
    gaugeInfo.checkpoint = time.reverted ? ZERO_INT : time.value;

    // update total current weight
    let currentTotalWeight = gaugeInfo.futureTotalWeight;
    gaugeInfo.currentTotalWeight = currentTotalWeight;

    // query total future weight
    let futureTotalWeight = gaugeController.try_points_total(time.value);
    gaugeInfo.futureTotalWeight = futureTotalWeight.reverted
      ? ZERO_INT
      : futureTotalWeight.value;

    gaugeInfo.save();

    // update individual gauges
    for (let i = 0; i < gaugeInfo.numGauges; i++) {
      let gaugeAddress = gaugeController.gauges(BigInt.fromI32(i));
      let gauge = getGauge(gaugeAddress.toHex());

      // update current weight
      let currentWeight = gauge.futureWeight;
      gauge.currentWeight = currentWeight;

      // query future weight
      let futureWeight = gaugeController.try_points_weight(
        gaugeAddress,
        gaugeInfo.checkpoint
      );
      gauge.futureWeight = futureWeight.reverted
        ? ZERO_INT
        : futureWeight.value.bias;
      gauge.save();
    }
  }
}
