import { BigInt } from "@graphprotocol/graph-ts";
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
import { Gauge, User, Vote } from "../generated/schema";

let ZERO_INT = BigInt.fromI32(0);

export function getGauge(gaugeAddress: string): Gauge {
  let gauge = Gauge.load(gaugeAddress);
  if (gauge == null) {
    gauge = new Gauge(gaugeAddress);
    gauge.address = gaugeAddress;
    gauge.save();
  }
  return gauge as Gauge;
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
  let userAddress = event.params.user.toHex();
  let gaugeAddress = event.params.gauge_addr.toHex();

  let user = getUser(userAddress);
  let vote = getVote(userAddress, gaugeAddress);

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
}

export function handleNewGauge(event: NewGauge): void {
  let gauge = getGauge(event.params.addr.toHex());
  gauge.save();
}
