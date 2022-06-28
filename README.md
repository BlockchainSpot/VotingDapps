# VotingDapps

## Test du contract Voting
```
#### Contract: Voting
    Register Section 
      ✔ Success : add voter addr1 from owner (178ms)
      ✔ Success : good workflow for add a voter  (40ms)
      ✔ Success : add registered voter 

    Proposal Section

      ✔ Success : can not register en event for the moment 
      ✔ Success : can not add proposal for the moment (38ms)
      ✔ Success : can not empty proposal (71ms)
      ✔ Success : test description and getter (64ms)
      ✔ Success :  (61ms)

    tallyVotes Section
      ✔ Test on require: tally vote cant be done if not in the right worfkflow status
      ✔ it's not the owner
      ✔ test on event on workflow status (71ms)
      ✔ test on winning proposal description and vote count (72ms)
    Global test
      ✔ start proposal registering
      ✔ add2 test register proposal
      ✔ end proposal registering (55ms)
      ✔ start voting session (72ms)
      ✔ end voting session (108ms)

18 passing (4s)


