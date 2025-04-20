

function calculateProbability(observations: Array<boolean>, sensor: any) {

    let prior = sensor.prior; // starting prior

    /*
    P(B|A) * P(A)	
    -----	
    P(B|A) * P(A) + !P(B|A) * (1-P(A))	
    
    P(A) is the prior, but on each observation that becomes the new prior
    */

    for (let i = 0; i < sensor.observations.length; i++) {
        if (observations[i]) {
            const numerator = sensor.observations[i].prob_given_true * prior;
            const denominator = numerator + sensor.observations[i].prob_given_false * (1 - prior);

            prior = numerator / denominator;
        } else {
            // 
            const numerator = (1 - sensor.observations[i].prob_given_true) * prior;
            const denominator = numerator + (1 - sensor.observations[i].prob_given_false) * (1 - prior);
        }

    }
    return prior;
}


var getPermutations = function(maxLen): boolean[][] {
    const list = [false, true];
    // Copy initial values as arrays
    var perm = list.map(function(val) {
        return [val];
    });
    // Our permutation generator
    var generate = function(perm, maxLen, currLen) {
        // Reached desired length
        if (currLen === maxLen) {
            return perm;
        }
        // For each existing permutation
        for (var i = 0, len = perm.length; i < len; i++) {
            var currPerm = perm.shift();
            // Create new permutation
            for (var k = 0; k < list.length; k++) {
                perm.push(currPerm.concat(list[k]));
            }
        }
        // Recurse
        return generate(perm, maxLen, currLen + 1);
    };
    // Start with size 1 because of initial values
    return generate(perm, maxLen, 1);
};


function run() {
 
    var doc = jsyaml.load((<HTMLTextAreaElement>document.getElementById("yaml")).value);
    if(typeof doc === "undefined") {
        alert("Invalid yaml");
        return;
    }
    
    const sensor = doc["binary_sensor"][0];
    var res = getPermutations(sensor.observations.length);


    let rows = "";
    for (let perm of res) {

        const prob = calculateProbability(perm, sensor);
        const permText = perm.map((a, idx) => a ? "T" : "F");


        const permExplanation = perm.map((a, idx) => a ? sensor.observations[idx].entity_id + " is " + sensor.observations[idx].to_state : "")
            .filter(v => v != "")
            .join("<br/>");

        const probClass = prob >= sensor.probability_threshold ? "higher" : "lower";
        rows += `<tr><td>
                    ${permExplanation}
                 </td>
                 <td class='${probClass}'>
                      ${prob.toFixed(2)}
                 </td>
             </tr>`
    }


    const table = `<label>Result:</label><table class="table">
            <thead>
                <tr>
                    <th>State</th>
                    <th>Prob</th>
                </tr>
            </thead>
            <tbody>` + rows + `
            </tbody>
                `;


    document.getElementById("table-container").innerHTML = table;
}

//document.getElementById("yaml").addEventListener("change", () => run());
document.getElementById("run").addEventListener("click", () => run());



