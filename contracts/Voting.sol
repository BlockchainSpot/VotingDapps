// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";


contract Voting is Ownable {

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }


    mapping(address => Voter) public voters;
    WorkflowStatus public workflowStatus;


    Proposal[] public proposalsArray;
	address[] public addresses;
    uint[] public winningProposalID;

    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);    
    event VoterRegistered(address voterAddress); 
    event unregistered(address voterAddress);
    event ProposalRegistered(uint proposalId);
    event Voted(address voter, uint proposalId);


    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "not on the wl");
        _;
    }

    //Getter : 

    function getProposals() external view  onlyVoters onlyOwner returns(Proposal[] memory) {
        return proposalsArray;
    }

	 function getAddresses() external view onlyVoters onlyOwner returns(address[] memory){
		 return addresses;
	 }

// State //

    modifier checkWorkflowStatus(uint _num) {
        require (workflowStatus==WorkflowStatus(uint(_num)-1),"bad workflowStatus");
        require (_num != 4, "il faut lance tally votes");
    _;
    }

    function setWorkflowStatus(uint _num) external checkWorkflowStatus(_num) onlyOwner {
        WorkflowStatus old = workflowStatus;
        workflowStatus  = WorkflowStatus(_num);
        emit WorkflowStatusChange(old, workflowStatus); 
    }


// add voter to WL and add proposal : 

  function addWL(address _voter) external onlyOwner {
        require(voters[_voter].isRegistered != true, "you are already registered");
        voters[_voter].isRegistered = true;
		addresses.push(_voter);
        emit VoterRegistered(_voter);

    }

    function addProposal(string memory _desc) external  {
        require(voters[msg.sender].isRegistered == true, "address not whitelisted");
        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        
        emit ProposalRegistered(proposalsArray.length-1);
    }

// voter :

    function Vote(uint proposalId) external   {
        require(voters[msg.sender].isRegistered,"Your address is not on the WL");
        require(voters[msg.sender].hasVoted == false, "Address has already voted");
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;
        proposalsArray[proposalId].voteCount++;
        emit Voted(msg.sender, proposalId);
        }



    function tallyDraw() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, " current status is not vting session ended");
        uint hightesCount;

        for (uint i = 0; i < proposalsArray.length; i++) {
            if (proposalsArray[i].voteCount > hightesCount) {
                hightesCount = proposalsArray[i].voteCount;
            }
        }

        for (uint i ; i > proposalsArray.length; i ++) {
            if (proposalsArray[i].voteCount == hightesCount){
                winningProposalID.push(i);
            }
        }

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }


}