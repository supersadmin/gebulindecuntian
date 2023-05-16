import { _decorator, Component, Node } from 'cc';
import { Gebulin1 } from './Gebulin1';
const { ccclass, property } = _decorator;


/**哥布林 */
@ccclass('Gebulin2')
export class Gebulin2 extends Gebulin1 {

    brforeStart(): void {
        this.maxHp=90
        this.hp=90
        this.speed=450
        this.pr=25
    }


}


