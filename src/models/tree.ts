/**
 * Class construct for a binary node tree
 */
export class BinaryNode<T> {
    
    private _parent?: BinaryNode<T>;
    private _left?: BinaryNode<T>;
    private _right?: BinaryNode<T>;
    public value?: T;

    /**
     * Creates a new Node for a binary tree
     * @param parent parent of the newly created node. 'undefined' = root node
     */
    constructor(parent: BinaryNode<T> | undefined = undefined) {
        this._parent = parent;
    }

    public get parent() {
        return this._parent;
    }

    public get right() {
        return this._right;
    }

    public get left() {
        return this._left;
    }

    /**
     * creating new node on the left side of the current node if none exists
     */
    public insertLeft() {
        if(this.left === undefined)
            this._left = new BinaryNode<T>(this);
    }

    /**
     * creating new node on the right side of the current node if none exists
     */
    public insertRight() {
        if(this._right === undefined)
            this._right = new BinaryNode<T>(this);
    }

    /**
     * search for the next node on the right side to this on the same level
     * @returns next right same level node or 'undefined' if none found
     */
    public getRightLevelNode(): BinaryNode<T> | undefined {

        // go up and find upper level next right node we haven't visited by doing so
        let levelCounter = 0;
        let currentNode: BinaryNode<any> = this;
        while(currentNode.parent !== undefined && currentNode.parent.right === currentNode) {
            currentNode = currentNode.parent;
            levelCounter++;
        }

        // check if we landed on the root node or an empty right side -> no next right node found
        if(currentNode.parent === undefined || currentNode.parent.right === undefined)
            return undefined;

        // going down again on the right side the same amount levels we have gone up
        currentNode = currentNode.parent.right;
        while(levelCounter > 0) {
            if(currentNode.left === undefined)
                return undefined;
            currentNode = currentNode.left;
            levelCounter--;
        }

        return currentNode;
    }
}