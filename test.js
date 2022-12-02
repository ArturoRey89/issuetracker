let ob1 = {first: "test"}
let ob2 = {second: "", third: 12, last:  false}
let ob3 ={ ...ob1, ...ob2}
let ob4 = Object.entries(ob3)
                    .filter( (val,key) => ((typeof val[1] == "boolean") || val[1]))


console.log(ob3)
console.log(ob4)
console.log(Object.fromEntries(ob4))