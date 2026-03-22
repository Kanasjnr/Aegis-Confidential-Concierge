import { contracts, fixtures } from "alkahest-ts";

console.log("EAS:", !!fixtures.EAS, !!fixtures.EAS?.bytecode?.object);
console.log("SchemaRegistry:", !!fixtures.SchemaRegistry, !!fixtures.SchemaRegistry?.bytecode?.object);
console.log("TrustedOracleArbiter:", !!contracts.TrustedOracleArbiter, !!contracts.TrustedOracleArbiter?.abi?.bytecode?.object);
console.log("CommitRevealObligation:", !!contracts.CommitRevealObligation, !!contracts.CommitRevealObligation?.abi?.bytecode?.object);
console.log("ERC20EscrowObligation:", !!contracts.ERC20EscrowObligation, !!contracts.ERC20EscrowObligation?.abi?.bytecode?.object);
console.log("ERC20PaymentObligation:", !!contracts.ERC20PaymentObligation, !!contracts.ERC20PaymentObligation?.abi?.bytecode?.object);

console.log("\nCommitRevealObligation keys:", Object.keys(contracts.CommitRevealObligation));
if (contracts.CommitRevealObligation.abi) {
    console.log("CommitRevealObligation.abi keys:", Object.keys(contracts.CommitRevealObligation.abi));
}
