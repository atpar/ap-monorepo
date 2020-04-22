# **ACTUS** Solidity

Solidity implementation of **ACTUS** Contract Types (https://www.actusfrf.org/algorithmic-standard)

## Smart Contracts

### Core
Contains banking-grade financial logic such as ACTUS day-count & end-of-month conventions, ACTUS datatypes and floating point arithmetic used throughout all ACTUS engines. 

### Engines
Contains ACTUS state machine engines for each ACTUS Contract Type. An Engine implements the state transition & payoff functions and the schedule generation logic for an ACTUS Contract Type. Engines are stateless smart contracts, thus can be used on-chain as well as off-chain (e.g. by using the EVM as a TEE).

### Basic workflow
1. Define an ACTUS term sheet depending on the financial contract you want to model and derive the `LifecycleTerms` object from that
2. Compute EventType-specific schedules via `computeNonCyclicScheduleSegment()` and `computeCyclicScheduleSegment()` (you may combine the schedules into one schedule for easier handling) as well as the initial state of the asset via `computeInitialState()` via the corresponding Engine contract
3. Evaluate each event in the schedule by computing its payoff via `computePayoffForEvent()` and the resulting state via `computeStateForEvent()` (note: the payoff has to be computed from the previous state - always compute payoff first then the  state)

## Development

### Requirements and Setup
See [README](https://github.com/atpar/ap-monorepo#development) in root directory.

### Testing
```sh
yarn test
```

## Implemented Conventions
- [x] Contract-Role-Sign-Convention (for PAM)
- [x] Contract-Default-Convention

### Business-Day-Count-Conventions
- [x] SCF (Shift/Calculate following)
- [x] SCMF (Shift/Calculate modified following)
- [x] CSF (Calculate/Shift following)
- [x] CSMF (Calculate/Shift modified following)
- [x] SCP (Shift/Calculate preceding)
- [x] SCMP (Shift/Calculate modified preceding)
- [x] CSP (Calculate/Shift preceding)
- [x] CSMP (Calculate/Shift modified preceding)

### Year-Fraction-Conventions (Day-Count-Methods)
- [x] A/AISDA (Actual Actual ISDA)
- [x] A/360 (Actual Three Sixty)
- [x] A/365 (Actual Three Sixty Five)
- [x] 30E/360ISDA (Thirty E Three Sixty ISDA)
- [x] 30E/360 (Thirty E Three Sixty)
- [ ] 30/360 (Thirty Three Sixty)
- [ ] BUS/252 (Business Two Fifty Two)
- [x] 1/1

### End-Of-Month-Conventions
- [x] Same Day Shift
- [x] End-Of-Month Shift
