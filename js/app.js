/*
    Event handler for when they upload a file
*/
document.getElementById("txt-file").onchange = function(e) {
    // Clear out existing graphs
    clearChildrenById("graph-container");

    renderLoader("graph-container");

    const http = new XMLHttpRequest();
    const url = "/upload";
    http.open("POST", url, true);

    // Send the proper header information along with the request
    http.setRequestHeader("Content-type", "text/plain");

    // Call a function when the request state changes
    http.onreadystatechange = function() {
        // If the request has finished (state 4 = DONE)
        if(http.readyState == 4) {
            if(http.status == 200){
                try {
                    // Replace single quotes with double ones and parse the backend response into array of objects
                    const countArray = JSON.parse(http.responseText.split("'").join('"'));
                    renderGraph(countArray, "graph-container");
                }
                catch (e) {
                    clearChildrenById("graph-container");
                    renderError("graph-container", "Error converting server response to JSON, check that you uploaded a plain text file");
                }
            }
            else {
                clearChildrenById("graph-container");
                renderError("graph-container", http.responseText || "No response from server");
            }
        }
    }

    http.send(e.target.files[0]);
    
    // Reset input so onchange handler works again if they upload another file
    e.target.value = null;
};


/*
    Clear all the child elements of given element
*/
function clearChildrenById(elemID) {
    let graphContainer = document.getElementById(elemID);
    while (graphContainer.firstChild) {
        graphContainer.removeChild(graphContainer.firstChild);
    }
}


/*
    Render supplied error message under the given parent element
*/
function renderError(parent, message) {
    let errorMsg = document.createElement('div');
    errorMsg.innerText = message;
    errorMsg.className = "error-msg";
    document.getElementById(parent).appendChild(errorMsg);
}


/*
    Render the loader under the given parent element
*/
function renderLoader(parent) {
    // Loader container
    let loader = document.createElement('div');
    loader.className = "loader JS_ON";

    // Attach animated words to loader
    for (let i=0; i<3; ++i) {
        let word = document.createElement('span');
        word.className = "word";
        loader.appendChild(word);
    }

    // Loading element text
    let loadingText = document.createElement('span');
    loadingText.className="getting-there";
    loadingText.innerText = "counting...";
    loader.appendChild(loadingText);

    // Append loader to parent
    document.getElementById(parent).appendChild(loader);
}


/*
    Render the word count bar chart under the given parent element
*/
function renderGraph(wordCounts, parent, clearParentsChildren = true) {
    let graphContainer = document.getElementById(parent);

    if (clearParentsChildren) {
        clearChildrenById(parent);
    }

    // If there's no words
    if (wordCounts.length === 0) {
        renderError(parent, "No words in file");
        return;
    }

    // Create bar graph wrapper
    let barWrapper = document.createElement('div');
    barWrapper.id = "bars-wrapper";
    graphContainer.appendChild(barWrapper);

    // Create bar graph
    for(let i=0; i<wordCounts.length; i++) {
        // Create word container
        let wordContainer = document.createElement('div');
        wordContainer.className = "word-container";
        wordContainer.innerText = wordCounts[i].word;
        barWrapper.appendChild(wordContainer);
        
        // Create ratio container
        let ratioContainer = document.createElement('div');
        ratioContainer.className = "ratio-container";
        ratioContainer.innerText = `${i+1} - ${wordCounts[i].ratioToTopResult}`;
        barWrapper.appendChild(ratioContainer);
        
        // Create bar container
        let barContainer = document.createElement('div');
        barContainer.className = "bar-container";

        // Create bar
        let bar = document.createElement('div');
        bar.className = "bar";
        bar.style.width = `${wordCounts[i].percentage}%`;

        // Bar word count
        let barCount = document.createElement('div');
        barCount.className = "bar-count";
        barCount.innerText = wordCounts[i].count.toLocaleString();

        // Create count pointer
        let countPointer = document.createElement('div');
        countPointer.className= "count-pointer";
        
        // Append bar, bar word count and the little line pointing to the count, to the container element
        barContainer.appendChild(bar);
        barContainer.appendChild(barCount);
        barContainer.appendChild(countPointer);

        // Append entire result row to bar container element
        barWrapper.appendChild(barContainer);
    }
}