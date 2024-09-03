export default class SOS {
    components: SOSComponent[] = [];
}

export interface SOSComponent {
    identifier: number;
    dht: number;
}