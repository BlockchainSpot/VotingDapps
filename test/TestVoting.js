const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const instance = artifacts.require('Voting');

contract("Voting", function (accounts) {
  const owner = accounts[0];
  const add1 = accounts[1];
  const add2 = accounts[2];
  const add3 = accounts[3];

  let Voting;

  context("Register Section ", function() {

    // Prérequis :

    beforeEach(async function () {
      Voting = await instance.new({from: owner});
    })


      it('Success : add voter addr1 from owner', async function () {
        await expectRevert(Voting.addVoter(add1, {from: add1}),
        "Ownable: caller is not the owner")
      });

      it("Success : good workflow for add a voter ", async function () {
        await Voting.startProposalsRegistering({from: owner})
        await expectRevert(Voting.addVoter(add1, {from: owner}),
        "Voters registration is not open yet")
      });
    
      it("Success : add registered voter ", async function () {
        await Voting.addVoter(add1, {from: owner})
        let VoterRegisteredBool = await Voting.getVoter(add1, {from: add1})
        expect(VoterRegisteredBool.isRegistered).to.equal(true);
      });
    })   

  context("Proposal Section", function() {

    // Prérequis :

    beforeEach(async function () {
        Voting = await instance.new({from: owner});
        await Voting.addVoter(add1, {from: owner})
        await Voting.addVoter(add2, {from: owner})
        await Voting.addVoter(add3, {from: owner})

    })
    
      it('Success : can not register en event for the moment ', async function () {
        await expectRevert(Voting.addProposal("add1_Saucisse frite", {from: add1}),
        "Proposals are not allowed yet")
      })

      it('Success : can not add proposal for the moment', async function () {
        await Voting.startProposalsRegistering({from: owner})
        await expectRevert(Voting.addProposal("Wrong Owner", {from: owner}),
        "You're not a voter")
      })

      it('Success : can not empty proposal', async function () {
        await Voting.startProposalsRegistering({from: owner})
        await expectRevert(Voting.addProposal("", {from: add2}),
            "Vous ne pouvez pas ne rien proposer")
      })

      it("Success : test description and getter", async function () {
        await Voting.startProposalsRegistering({from: owner})
        await Voting.addProposal("Saucisse frite", {from: add1})
        const propoID = 0;
        let add1ProposalID = await Voting.getOneProposal(propoID , {from: add1});
        expect(add1ProposalID.description).to.be.equal("Saucisse frite");
      })

      it("Success : ", async function () {
        await Voting.startProposalsRegistering({from: owner})
        let receipt  = await Voting.addProposal("proposaladd1", {from: add1})
        const ID = 0;
        expectEvent(receipt, "ProposalRegistered", {proposalId: new BN(ID)});
      })

      it("Success : ", async function () {
        await Voting.startProposalsRegistering({from: owner})
        await Voting.addProposal("proposaladd1", {from: add1})
        const ID = 1;
        await expectRevert.unspecified( Voting.getOneProposal(ID , {from: add1}));
      })
  })
  

  context("tallyVotes Section", function() {

    // Prérequis :

    beforeEach(async function () {
      Voting = await instance.new({from: owner});
      await Voting.addVoter(add1, {from: owner})
      await Voting.addVoter(add2, {from: owner})
      await Voting.addVoter(add3, {from: owner})
      await Voting.startProposalsRegistering({from: owner})
      await Voting.addProposal("add1Proposal", {from: add1})
      await Voting.addProposal("add2Proposal", {from: add2})
      await Voting.addProposal("add3Proposal", {from: add3})
      await Voting.endProposalsRegistering({from: owner})
      await Voting.startVotingSession({from: owner})
      await Voting.setVote(1, {from: add1})
      await Voting.setVote(2, {from: add2})
      await Voting.setVote(2, {from: add3})
      })

      it('Test on require: tally vote cant be done if not in the right worfkflow status', async function () {
        await expectRevert(
            Voting.tallyVotes({from: owner}),
            "Current status is not voting session ended")
      })

      it("it's not the owner", async function () {
        await Voting.endVotingSession({from: owner})
        await expectRevert(
            Voting.tallyVotes({from: add1}),
            "Ownable: caller is not the owner")
      })

      it('test on event on workflow status', async function () {
        await Voting.endVotingSession({from: owner})
        let receipt = await Voting.tallyVotes({from: owner});
        expectEvent(receipt,'WorkflowStatusChange', {previousStatus: new BN(4), newStatus: new BN(5)})

      })

      it('test on winning proposal description and vote count', async function () {
        await Voting.endVotingSession({from: owner})
        await Voting.tallyVotes({from: owner});
        let winningID = await Voting.winningProposalID.call();
        let winningProposal= await Voting.getOneProposal(winningID, {from:add1});
        expect(winningProposal.description).to.equal('add3Proposal');
        expect(winningProposal.voteCount).to.equal('2');
      })
  })

  context("Global test", function() {

    beforeEach(async function () {
        Voting = await instance.new({from: owner});
    })

    // Prérequis :

    it("start proposal registering", async() => {
        let status = await Voting.workflowStatus.call();
        expect(status).to.be.bignumber.equal(
        new BN(0));
        let startProposal = await Voting.startProposalsRegistering({from:owner});
        expectEvent(startProposal, 'WorkflowStatusChange', {previousStatus: new BN(0),newStatus: new BN(1)});
    });
    it('add2 test register proposal', async function () {
        await expectRevert(
        Voting.startProposalsRegistering({from: add2}),
        "Ownable: caller is not the owner")
    })

    it("end proposal registering", async() => {
        await Voting.startProposalsRegistering({from:owner});
        let endProposal = await Voting.endProposalsRegistering({from:owner});
        expectEvent(endProposal, 'WorkflowStatusChange', {previousStatus: new BN(1),newStatus: new BN(2)});
    });

    it("start voting session", async() => {
        await Voting.startProposalsRegistering({from:owner});
        await Voting.endProposalsRegistering({from:owner});
        let startVote = await Voting.startVotingSession({from:owner});
        expectEvent(startVote, 'WorkflowStatusChange', {previousStatus: new BN(2),newStatus: new BN(3)});
    });

    it("end voting session", async() => {
        await Voting.startProposalsRegistering({from:owner});
        await Voting.endProposalsRegistering({from:owner});
        await Voting.startVotingSession({from:owner});
        let endVote = await Voting.endVotingSession({from:owner});
        expectEvent(endVote, 'WorkflowStatusChange', {previousStatus: new BN(3),newStatus: new BN(4)});
    });
  })
})