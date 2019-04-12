App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: () => {
    return App.initWeb3();
  },

  initWeb3: () => {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    web3 = new Web3(App.web3Provider)
    return App.initContract();
  },

  initContract: () => {
    $.getJSON("Election.json", election => {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  castVote: () => {
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance) {
      return instance.vote(candidateId, { from: App.account });
    }).then(result => {
      // Wait for votes to update
      App.render()
    }).catch(err => {
      console.error(err);
    });
  },

  listenForEvents: () => {
    App.contracts.Election.deployed().then(instance => {
      instance.votedEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch((error, event) => {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: () => {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
  
    loader.show();
    content.hide();
  
    // Load account data
    App.account = web3.eth.accounts[2];
    $("#accountAddress").html('<span class="hidden-sm">Account: </span>' + web3.eth.accounts[2]);
  
    // Load contract data
    App.contracts.Election.deployed().then(instance => {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    })
    .then(candidatesCount => {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
  
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
  
      for (var i = 1; i <= candidatesCount; i++) {
        electionInstance.candidates(i).then(candidate => {
          var id = candidate[0];
          var name = candidate[1];
          var party = candidate[2];
          var voteCount = candidate[3];
  
          // Render candidate Result
          var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + party + "</td><td>" + voteCount + "</td></tr>"
          candidatesResults.append(candidateTemplate);
  
          // Render candidate ballot option
          var candidateOption = "<option value='" + id + "' >" + name + " - " + party +  "</ option>"
          candidatesSelect.append(candidateOption);
        });
      }
      return electionInstance.voters(App.account);
    })
    .then(hasVoted => {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    })
    .catch(error => {
      console.warn(error);
    });
  }
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});