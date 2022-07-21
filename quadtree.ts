import { Shape, Rectangle } from "./shape.js";

enum bound {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT
};

export class QuadTree {
    private root: QNode;
    showBounds: boolean = false;

    constructor(view: Rectangle, maxDepth: number, maxChildren: number) {
        this.root = new QNode(view, 0, maxDepth, maxChildren);
    }

    insert(item: Shape): void {
        this.root.insert_overlapping(item);
    }

    clear(): void {
        this.root.clear();
    }

    from_point(x: number, y: number): Set<Shape> {
        return this.root.query_from_point(x, y);
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.root.render(ctx, this.showBounds);
    }

    collision_check(): void {
        this.root.collision_check();
    }
}

class QNode {
    private children: Set<Shape>;
    private nodes: Array<QNode>;
    protected depth: number;
    protected rect: Rectangle;
    private maxDepth: number;
    private maxChildren: number;

    constructor(rect: Rectangle, depth: number, maxDepth: number, maxChildren: number) {
        this.rect = rect;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.maxChildren = maxChildren;
        this.nodes = [];
        this.children = new Set();
    }

    clear(): void {
        this.children.clear();
        for (let node of this.nodes) {
            node.clear();
        }
        this.nodes.length = 0;
    }

    render(ctx: CanvasRenderingContext2D, showBounds: boolean): void {
        if (showBounds === true) {
            this.rect.render(ctx);
        }
        if (this.children.size) {
            for (let child of this.children) {
                child.render(ctx);
            }
        } else if (this.nodes.length) {
            for (let node of this.nodes) {
                node.render(ctx, showBounds);
            }
        }
    }

    query_from_point(x: number, y: number): Set<Shape> {
        if (this.nodes.length) {
            let index = this.get_bound(x, y);
            return this.nodes[index].query_from_point(x, y);
        }
        return this.children;
    }

    insert(item: Shape): void {
        if (this.nodes.length) {
            let index = this.get_bound(item.x, item.y);
            this.nodes[index].insert(item);
            return;
        }
        this.children.add(item);
        if (this.children.size > this.maxChildren && this.depth < this.maxDepth) {
            this.subdivide();
            for (let child of this.children) {
                this.insert(child);
            }
            this.children.clear();
        }
    }

    insert_overlapping(item: Shape): void {
        if (this.nodes.length) {
            let index: bound;
            // topleft
            index = this.get_bound(item.x, item.y);
            this.nodes[index].insert_overlapping(item);
            //topright
            index = this.get_bound(item.x + item.width, item.y);
            this.nodes[index].insert_overlapping(item);
            //bottomleft
            index = this.get_bound(item.x, item.y + item.height);
            this.nodes[index].insert_overlapping(item);
            //bottomright
            index = this.get_bound(item.x + item.width, item.y + item.height);
            this.nodes[index].insert_overlapping(item);
            return;
        }
        this.children.add(item);
        if (this.children.size > this.maxChildren && this.depth < this.maxDepth) {
            this.subdivide();
            for (let child of this.children) {
                this.insert_overlapping(child);
            }
            this.children.clear();
        }
    }

    collision_check() {
        if (this.nodes.length) {
            for (let node of this.nodes) {
                node.collision_check();
            }
            return;
        }
        this.children.forEach((shape) => this.children.forEach((other_shape) => shape.collide(other_shape)));
    }

    private get_bound(x: number, y: number): bound {
        const left = x <= (this.rect.x + (this.rect.width >> 1));
        const top = y <= (this.rect.y + (this.rect.height >> 1));
        if (top && left) return bound.TOP_LEFT;
        if (top) return bound.TOP_RIGHT;
        if (left) return bound.BOTTOM_LEFT;
        return bound.BOTTOM_RIGHT;
    }

    subdivide(): void {
        const x = this.rect.x;
        const y = this.rect.y;
        const w = this.rect.width >> 1;
        const h = this.rect.height >> 1;
        const topleft = new Rectangle(x, y, w, h);
        const topright = new Rectangle(x + w, y, w, h);
        const bottomleft = new Rectangle(x, y + h, w, h);
        const bottomright = new Rectangle(x + w, y + h, w, h);
        this.nodes[bound.TOP_LEFT] = new QNode(topleft, this.depth + 1, this.maxDepth, this.maxChildren);
        this.nodes[bound.TOP_RIGHT] = new QNode(topright, this.depth + 1, this.maxDepth, this.maxChildren);
        this.nodes[bound.BOTTOM_LEFT] = new QNode(bottomleft, this.depth + 1, this.maxDepth, this.maxChildren);
        this.nodes[bound.BOTTOM_RIGHT] = new QNode(bottomright, this.depth + 1, this.maxDepth, this.maxChildren);
    }

}