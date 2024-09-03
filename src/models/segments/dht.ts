import RunLengthPair from "../runlength";
import { BinaryNode } from "../tree";

export default class DHT {
    identifier: number = 0;
    symbolSizes: number[] = [];
    symbols: number[] = [];
    tree: BinaryNode<number> | BinaryNode<RunLengthPair> = new BinaryNode<number>();
}