function WordCheck(word){
    this.word = word;
    this.wordFound = this.tempCheck(word);
    return this.wordFound;
}

// not being used!
WordCheck.prototype.checkWord = function(word){
    /*
    var self = this;
    var promise = new Promise(function(resolve,reject){
        var apiCheck = self.APIcheck(word);
        if(apiCheck > 0){
            resolve(apiCheck);
        } else {
            reject(apiCheck)
        }
    })
    
    promise.then(
        function(result){return result},
        function(error){console.log(error)}
    );
    */
    
    //var apiCheck = this.APIcheck(word);
    //console.log(apiCheck);
    //return this.tempCheck(word);
}

WordCheck.prototype.APIcheck = function(word){
    var self = this;
    // Necessary to bypass the 'Access-Control-Allow-Origin' error
    const proxyURL = "https://cors.io/?"; 
    var response;
    const getUrl = 'https://api.datamuse.com/words?sp='+word+'';
    try{
        // this API isn't returning great results. Only use it if nothing better is found
      response = fetch(proxyURL + getUrl)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data[0]);
            console.log(data[1]);
            if(data[0].score > 500){
                return 1;
            } else {
                return 0;
            }
        })
        
    } catch(err){
        response = -1;
    } 
    return response
}

//not being used!
WordCheck.prototype.tempCheck = function(word){
    var tempWords = ['AND','BUT','THE','HUE','END','NET','ANT','TAN'];
    for(var i=0;i<tempWords.length;i++){
        if(word == tempWords[i]){
            return true;
        } 
    }
    return false;
}

WordCheck.prototype.JSONCheck = function(word){
    console.log("Checking JSON");
}