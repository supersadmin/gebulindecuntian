import { _decorator, Component, Node } from 'cc';
import { Villain } from './Villain';
const { ccclass, property } = _decorator;

/**树精类 */
@ccclass('Sujin')
export class Sujin extends Villain {

    brforeStart(): void {
        this.maxHp=250
        this.hp=250
        this.speed=200
        this.pr=25
    }

}


