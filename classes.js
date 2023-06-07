class Rectangle {
    constructor(a,b){
        this.a = a;
        this.b = b;
    }

    square() {
        return this.a * this.b;
    }
}

class Tr {
    constructor(a,b,c){
        this.a = a;
        this.b = b;
        this.c = c;
    }

    P() {
        return this.a + this.b + this.c;
    }
}

let rect1 = new Rectangle(2,4);
let rect2 = new Rectangle(3,8);
let rect3 = new Tr(3,4,5);
let rect4 = new Tr(6,8,10);

console.log(rect4.P());