import { _decorator, Component, Node,UITransform } from 'cc';
const { ccclass, property,integer } = _decorator;

/**该组件会对所属节点的子节点进行排序 */
@ccclass('SortNodeLayer')
export class SortNodeLayer extends Component {

    /**每几帧进行一次排序 */
    @integer
    i:number=1

    _i=0

    update(deltaTime: number) {
        if(++this._i%this.i!==0){
            return
        }
        const childList = this.node.children
        // console.log(childList.length)
        const t = [...childList]
        t.sort((a, b) => (b.position.y - b.getComponent(UITransform)?.height / 2) - (a.position.y - a.getComponent(UITransform)?.height / 2))
        t.forEach((item, i) => item.setSiblingIndex(i))
    }
}


