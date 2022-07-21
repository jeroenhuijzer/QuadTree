export interface Shape {
    x: number;
    y: number;
    width: number;
    height: number;

    render(ctx: CanvasRenderingContext2D): void;
    update(timeStamp: number): void;
    collide(other: Shape): void;
    outer_bounds(maxWidth: number, maxHeight: number): void;
}

export class Rectangle implements Shape {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    update(timeStamp: number) {

    }

    outer_bounds(maxWidth: number, maxHeight: number) {
    }

    collide(other: Shape) {

    }
}

export class Circle implements Shape {
    cx: number;
    cy: number;
    r: number;
    protected sAngle: number;
    protected eAngle: number;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.sAngle = 0;
        this.eAngle = 2 * Math.PI;
        this.cx = x + r
        this.cy = y + r
        this.width = 2 * r;
        this.height = 2 * r;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.r, this.sAngle, this.eAngle);
        ctx.stroke()
    }

    update(timeStamp: number) {

    }

    outer_bounds(maxWidth: number, maxHeight: number) {
    }


    collide(other: Shape) {

    }
}

export class Particle extends Circle {
    private vx: number;
    private vy: number;
    isColliding: boolean = false;
    mass: number;
    constructor(x: number, y: number, r: number) {
        super(x, y, r);
        this.vx = 3;
        this.vy = 2;
        this.mass = r;
    }

    update(timeStamp: number) {
        this.isColliding = false;
        this.x += this.vx * timeStamp;
        this.y += this.vy * timeStamp;
        this.cx = this.x + this.r;
        this.cy = this.y + this.r;
    }

    outer_bounds(maxWidth: number, maxHeight: number) {
        if (this.cx < this.r) {
            this.vx = Math.abs(this.vx);
            this.cx = this.r
            this.x = 0
        } else if (this.cx > maxWidth - this.r) {
            this.vx = -Math.abs(this.vx);
            this.cx = maxWidth - this.r;
            this.x = this.cx - this.r;
        }
        if (this.cy < this.r) {
            this.vy = Math.abs(this.vy);
            this.cy = this.r;
            this.y = 0;
        } else if (this.cy > maxHeight - this.r) {
            this.vy = -Math.abs(this.vy)
            this.cy = maxHeight - this.r;
            this.y = this.cy - this.r;
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.fillStyle = this.isColliding ? '#ff8080' : '#0099b0';
        ctx.arc(this.cx, this.cy, this.r, this.sAngle, this.eAngle);
        ctx.fill()
    }

    collide(other: Particle): void {
        if (this.isColliding || other === this) {
            return;
        }
        let squareDistance = (this.cx - other.cx) * (this.cx - other.cx) + (this.cy - other.cy) * (this.cy - other.cy);
        this.isColliding = squareDistance <= ((this.r + other.r) * (this.r + other.r));
        if (this.isColliding === true) {
            other.isColliding = true;
            let vCollision = { x: other.cx - this.cx, y: other.cy - this.cy };
            let distance = Math.sqrt((other.cx - this.cx) * (other.cx - this.cx) + (other.cy - this.cy) * (other.cy - this.cy));
            let vCollisionNorm = { x: vCollision.x / distance, y: vCollision.y / distance };
            let vRelativeVelocity = { x: this.vx - other.vx, y: this.vy - other.vy };
            let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
            if (speed > 0) {
                let impulse = 2 * speed / (this.mass + other.mass)
                this.vx -= (impulse * other.mass * vCollisionNorm.x);
                this.vy -= (impulse * other.mass * vCollisionNorm.y);
                other.vx += (impulse * this.mass * vCollisionNorm.x);
                other.vy += (impulse * this.mass * vCollisionNorm.y);
            }
        }
    }
}