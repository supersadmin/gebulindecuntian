import { _decorator, Component, Label, Node } from 'cc';
import { myFind } from './getDirection';
import { ManageGame1 } from '../manage/ManageGame1';
const { ccclass, property } = _decorator;

/**获取击杀数量在文本节点上 */
@ccclass('GetKill')
export class GetKill extends Component {

    start() {
        const manage=myFind('manageNode').getComponent(ManageGame1)
        const label=this.getComponent(Label)
        manage.onKillFn.add(n=>{
            label.string=String(n)
        })
    }

    update(deltaTime: number) {
        
    }
}




