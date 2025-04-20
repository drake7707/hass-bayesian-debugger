function calculateProbability(observations, sensor) {
    var prior = sensor.prior; // starting prior
    /*
    P(B|A) * P(A)
    -----
    P(B|A) * P(A) + !P(B|A) * (1-P(A))
    
    P(A) is the prior, but on each observation that becomes the new prior
    */
    for (var i = 0; i < sensor.observations.length; i++) {
        if (observations[i]) {
            var numerator = sensor.observations[i].prob_given_true * prior;
            var denominator = numerator + sensor.observations[i].prob_given_false * (1 - prior);
            prior = numerator / denominator;
        }
        else {
            // 
            var numerator = (1 - sensor.observations[i].prob_given_true) * prior;
            var denominator = numerator + (1 - sensor.observations[i].prob_given_false) * (1 - prior);
        }
    }
    return prior;
}
var getPermutations = function (maxLen) {
    var list = [false, true];
    // Copy initial values as arrays
    var perm = list.map(function (val) {
        return [val];
    });
    // Our permutation generator
    var generate = function (perm, maxLen, currLen) {
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
    var doc = jsyaml.load(document.getElementById("yaml").value);
    if (typeof doc === "undefined") {
        alert("Invalid yaml");
        return;
    }
    var sensor = doc["binary_sensor"][0];
    var res = getPermutations(sensor.observations.length);
    var rows = "";
    for (var _i = 0, res_1 = res; _i < res_1.length; _i++) {
        var perm = res_1[_i];
        var prob = calculateProbability(perm, sensor);
        var permText = perm.map(function (a, idx) { return a ? "T" : "F"; });
        var permExplanation = perm.map(function (a, idx) { return a ? sensor.observations[idx].entity_id + " is " + sensor.observations[idx].to_state : ""; })
            .filter(function (v) { return v != ""; })
            .join("<br/>");
        var probClass = prob >= sensor.probability_threshold ? "higher" : "lower";
        rows += "<tr><td>\n                    " + permExplanation + "\n                 </td>\n                 <td class='" + probClass + "'>\n                      " + prob.toFixed(2) + "\n                 </td>\n             </tr>";
    }
    var table = "<label>Result:</label><table class=\"table\">\n            <thead>\n                <tr>\n                    <th>State</th>\n                    <th>Prob</th>\n                </tr>\n            </thead>\n            <tbody>" + rows + "\n            </tbody>\n                ";
    document.getElementById("table-container").innerHTML = table;
}
//document.getElementById("yaml").addEventListener("change", () => run());
document.getElementById("run").addEventListener("click", function () { return run(); });
//# sourceMappingURL=main.js.map