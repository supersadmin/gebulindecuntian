import { _decorator, Component, instantiate, Node,Prefab,resources, Vec3 } from 'cc';
import { Villain } from '../Role/Villain';
import { mapSize, myFind } from '../other/getDirection';
import { ManageGame1 } from './ManageGame1';
const { ccclass, property } = _decorator;

/**在数组中随机返回一个值 */
const randomArray=(t:any[])=>t[Math.floor(Math.random()*t.length)]

/**在被附加的节点内部创建怪物节点 */
@ccclass('CreateVillain')
export class CreateVillain extends Component {
    /**能被创建的怪物预制体列表 */
    villainPrefabList:Prefab[]=[]
    manageNode:ManageGame1=null

    start() {
        this.villainPrefabList=[resources.get('prefab/gebulin2'),resources.get('prefab/gebulin1'),resources.get('prefab/zizunv'),resources.get('prefab/sujin')]
        this.manageNode=myFind('manageNode').getComponent(ManageGame1)

        this.schedule(()=>{
            this.createVillain(randomArray(this.villainPrefabList),this.manageNode.getRandomGamePlayer()?.getPosition())
        },0.6)

    }

    update(deltaTime: number) {
        
    }

    /**
    * 创建怪物放置在地图上,
    * 怪物的位置不应该距离角色过近
    * @param t 预制体对象
    * @param position 主角所处位置
    */
    createVillain(t: Prefab, position: Vec3) {
        if(t&&position){
            const d = instantiate(t)
            const k = rn(position.x, position.y, 650, 80)
            const p = new Vec3(...k)
            d.setPosition(p)
            this.node.addChild(d)
        }else{
            /**参数错误执行逻辑 */
        }

    }

}

/**通过给定的半径生成随机数
 * 这个函数是用来在角色周围生成怪物用的,不能离角色太近,太远又可能会超出地图
 */
function rn(x: number, y: number, startValue: number, offset: number): [number, number] {
    // 生成随机的极坐标半径和角度
    const r = Math.random() * offset + startValue;
    const theta = Math.random() * Math.PI * 2;

    // 将极坐标转换为直角坐标
    const dx = r * Math.cos(theta);
    const dy = r * Math.sin(theta);

    // 计算新的坐标
    let newX = x + dx;
    let newY = y + dy;

    if (Math.abs(newX) > mapSize.radiusX) {
        newX = newX - 2 * dx
    }
    if (Math.abs(newY) > mapSize.radiusY) {
        newY = newY - 2 * dy
    }
    return [newX, newY]
}
