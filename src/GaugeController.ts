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
import { Gauge } from "../generated/schema";

export function getGauge(gaugeAddress: string): Gauge {
  let gauge = Gauge.load(gaugeAddress);
  if (gauge == null) {
    gauge = new Gauge(gaugeAddress);
    gauge.address = gaugeAddress;
    gauge.save();
  }
  return gauge as Gauge;
}

export function handleCommitOwnership(event: CommitOwnership): void {}

export function handleApplyOwnership(event: ApplyOwnership): void {}

export function handleAddType(event: AddType): void {}

export function handleNewTypeWeight(event: NewTypeWeight): void {}

export function handleNewGaugeWeight(event: NewGaugeWeight): void {}

export function handleVoteForGauge(event: VoteForGauge): void {}

export function handleNewGauge(event: NewGauge): void {
  let gauge = getGauge(event.params.addr.toHex());
  gauge.save();
}
