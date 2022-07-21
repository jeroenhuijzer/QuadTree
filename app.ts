import { Shape, Particle, Rectangle } from "./shape.js";
import { QuadTree } from "./quadtree.js";

class application {
   private canvas: HTMLCanvasElement;
   private context: CanvasRenderingContext2D;
   private shapes: Array<Shape>;
   private qt: QuadTree;
   protected timeStamp: number = -1;

   constructor() {
      let canvas = document.getElementById("canvas") as HTMLCanvasElement;
      canvas.addEventListener("mouseup", this.pressEventHandler);
      canvas.width = window.innerHeight * .9;
      canvas.height = window.innerHeight * .9;
      let context = canvas.getContext("2d") as CanvasRenderingContext2D;
      this.canvas = canvas;
      this.context = context;
      this.shapes = [];
      const root = new Rectangle(0, 0, this.canvas.width, this.canvas.height);
      this.qt = new QuadTree(root, 5, 6);
      this.updateLoop(0);
      this.add_stuff(1000);
   }

   add_rect(x: number, y: number) {
      this.shapes.push(new Rectangle(x, y, 100, 100));
   }

   add_circle(x: number, y: number) {
      this.shapes.push(new Particle(x, y, 5));
   }

   add_stuff(amount: number) {
      for (let i = 0; i < amount; i++) {
         const x = Math.random() * this.canvas.width;
         const y = Math.random() * this.canvas.height;
         this.add_circle(x | 0, y | 0)
      }
   }

   private pressEventHandler = (ev: MouseEvent) => {
      let shapes = this.qt.from_point(ev.x, ev.y);
      console.log(shapes.size, 'particles at', ev.x, ',', ev.y)
      const particle = new Particle(ev.x, ev.y, 10);
      this.shapes.push(particle);
   }

   protected updateLoop(timeStamp: number): void {
      const timeInterval = (timeStamp - this.timeStamp) / (1000 / 60);
      this.timeStamp = timeStamp;
      //update
      this.qt.clear();
      for (let shape of this.shapes) {
         shape.update(timeInterval);
         shape.outer_bounds(this.canvas.width, this.canvas.height);
         this.qt.insert(shape);
      }
      //collision detection
      this.qt.collision_check();
      //clear
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      //draw
      this.qt.render(this.context);
      window.requestAnimationFrame((timeStamp) => this.updateLoop(timeStamp));
   }
}

new application();