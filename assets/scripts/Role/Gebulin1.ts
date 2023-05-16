import { _decorator, Component, Node } from 'cc';
import { Villain } from './Villain';
const { ccclass, property } = _decorator;


/**哥布林 */
@ccclass('Gebulin1')
export class Gebulin1 extends Villain {

    brforeStart(): void {
        this.maxHp=80
        this.hp=80
        this.speed=350
        this.pr=15
    }


}


