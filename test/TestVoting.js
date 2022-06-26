const Voting = artifacts.require("Voting");
const {BN, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

  contract("Voting", async accounts => {

    var VotingInstance;
 
    const owner = accounts[0];
    const user1 = accounts[1];
    const user2 = accounts[2];
    const user3 = accounts[3];
    const user4 = accounts[4];

    beforeEach('Config global for each test', async () => {
        VotingInstance = await Voting.new({from: owner});
    });

    // Only Owner : 

    it('onlyOwner should be able to addvoter', async () => {
        await expectRevert(VotingInstance.addWL(user1, {'from': user1}), "Ownable: caller is not the owner");
    });

    it('onlyOwner should be able to tallyVotes', async () => {
        await expectRevert(VotingInstance.tallyVotes({'from': user1}), "Ownable: caller is not the owner");
    });

    // end of Only Owner 

    // Start test function 

    it("Seulement l'admin peut enregistrer un adresse dans la WhiteList", async () => {
        await expectRevert.unspecified(VotingInstance.addWL(owner, {from: user1}));
    });


    it("ajouter une address dans la WL des votants ", async function(){
        let res = await VotingInstance.addWL(user2, {from: owner});
        let list = await VotingInstance.getAddresses();

        expect(list[0]).to.equal(user2);
        await expectEvent(res, "VoterRegistered", {voterAddress: user2}, "VoterRegistered event incorrect");
        });
    
 

})