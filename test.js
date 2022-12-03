let ob1 = {first: ""}
let ob2 = {second: "", third: "", last:  ""}
let ob3 ={ ...ob1, ...ob2}


let ob4 = Object.entries(ob3)
                    .filter( (val,key) => ((typeof val[1] == "boolean") || val[1]))


console.log(ob3)
console.log(ob4)
console.log({first: "testies", ...Object.fromEntries(ob4)})