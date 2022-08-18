import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts";
import { NewGauge } from "../generated/GaugeController/GaugeController";
import { Gauge } from "../generated/schema";

let ZERO_INT = BigInt.fromI32(0);

export function getGauge(gaugeAddress: Address): Gauge {
  let gauge = Gauge.load(gaugeAddress.toHex());
  if (gauge == null) {
    gauge = new Gauge(gaugeAddress.toHex());
    gauge.address = gaugeAddress;
    gauge.save();
  }
  return gauge as Gauge;
}


export function handleNewGauge(event: NewGauge): void {
  let gauge = getGauge(event.params.addr);
  gauge.save();
}
