import { BigInt } from "@graphprotocol/graph-ts"
import {
  GaugeController,
  CommitOwnership,
  ApplyOwnership,
  AddType,
  NewTypeWeight,
  NewGaugeWeight,
  VoteForGauge,
  NewGauge
} from "../generated/GaugeController/GaugeController"
import { ExampleEntity } from "../generated/schema"

export function handleCommitOwnership(event: CommitOwnership): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.admin = event.params.admin

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.get_corrected_info(...)
  // - contract.gauge_types(...)
  // - contract.gauge_relative_weight(...)
  // - contract.gauge_relative_weight(...)
  // - contract.gauge_relative_weight_write(...)
  // - contract.gauge_relative_weight_write(...)
  // - contract.get_gauge_weight(...)
  // - contract.get_type_weight(...)
  // - contract.get_total_weight(...)
  // - contract.get_weights_sum_per_type(...)
  // - contract.admin(...)
  // - contract.future_admin(...)
  // - contract.token(...)
  // - contract.voting_escrow(...)
  // - contract.n_gauge_types(...)
  // - contract.n_gauges(...)
  // - contract.gauge_type_names(...)
  // - contract.gauges(...)
  // - contract.vote_user_slopes(...)
  // - contract.vote_user_power(...)
  // - contract.last_user_vote(...)
  // - contract.points_weight(...)
  // - contract.time_weight(...)
  // - contract.points_sum(...)
  // - contract.time_sum(...)
  // - contract.points_total(...)
  // - contract.time_total(...)
  // - contract.points_type_weight(...)
  // - contract.time_type_weight(...)
  // - contract.global_emission_rate(...)
}

export function handleApplyOwnership(event: ApplyOwnership): void {}

export function handleAddType(event: AddType): void {}

export function handleNewTypeWeight(event: NewTypeWeight): void {}

export function handleNewGaugeWeight(event: NewGaugeWeight): void {}

export function handleVoteForGauge(event: VoteForGauge): void {}

export function handleNewGauge(event: NewGauge): void {}
