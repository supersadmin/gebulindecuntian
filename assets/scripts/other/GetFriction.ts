import { _decorator, Component, Label, Node } from 'cc';
import { myFind } from './getDirection';
import { ManageGame1 } from '../manage/ManageGame1';
const { ccclass, property } = _decorator;

/**获取分数显示在文本节点上 */
@ccclass('GetFriction')
export class GetFriction extends Component {
    
    start() {
        const manage=myFind('manageNode').getComponent(ManageGame1)
        const label=this.getComponent(Label)
        manage.onFrictionFn.add(n=>{
            label.string=String(Math.floor(n*10)/10)
        })
    }
}


