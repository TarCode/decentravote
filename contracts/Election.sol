pragma solidity >=0.4.22 <0.6.0;

contract Election {
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    event votedEvent (
        uint indexed _candidateId
    );

    mapping(uint => Candidate) public candidates;

    mapping(address => bool) public voters;

    uint public candidatesCount;

    function addCandidate (string memory _name, string memory _party) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);
    }

    function vote (uint _candidateId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        emit votedEvent(_candidateId);
    }


    // Constructor
    constructor() public {
        addCandidate("Cereal RamaPoser", "African Natural Compress");
        addCandidate("Mmoosey MyMoney", "Democrapic Alliarns");
        addCandidate("Aunti Patttt", "Herself");
    }
}