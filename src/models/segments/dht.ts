import { BinaryNode } from "../tree";

export default class DHT {
    identifier: number = 0;
    alternating: boolean = false; // type of HT, false = DC, true = AC
    symbolSizes: number[] = [];
    symbols: number[] = [];
    tree: BinaryNode<number> = new BinaryNode<number>();
}