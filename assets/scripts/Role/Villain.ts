import { _decorator, Collider2D, Rect, Contact2DType, Node, PhysicsSystem2D, Tween, find, BoxCollider2D, Vec3 } from 'cc';
import { Role } from './Role';
import { GamePlayer } from './GamePlayer';
import { ManageGame1 } from '../manage/ManageGame1';
import { computedDirection, physicsGroup } from '../other/getDirection';

const { ccclass, property } = _decorator;

/**是否监听怪物与怪物的碰撞,设置这个值只是为了方便调试,怪物互斥(解决怪物重叠)可能会消耗很多性能 */
const listenColliderVillain=true

/**怪物类基类 */
@ccclass('Villain')
export class Villain extends Role {

    static onVillainUnmountFn=new Set<(villain:Villain)=>void>()

    /**统一管理节点与预制体等资源的组件 */
    manageNode: ManageGame1 = null

    /**攻击的角色 */
    target: Node = null

    /**自身的碰撞机 */
    collider: BoxCollider2D = null

    /**被攻击的角色 */
    colliderMap = new Map<Collider2D, Function>()

    /**与怪物互相碰撞的节点列表,避免怪物重叠 */
    contactVillainSet = new Set<BoxCollider2D>()

    start() {

        this.manageNode = find('manageNode').getComponent(ManageGame1)

        Role.prototype.start.call(this)
        this.getTarget()

        this.collider = this.getComponent(BoxCollider2D)
        this.listenCollider()
    }

    update(dt: number) {

        this.refuseCollider()

        if (this.target && this.target.isValid) {
            this.move(dt, this.target)
        } else {
            this.target = this.getTarget()
        }

    }

    /**开始监听碰撞 */
    listenCollider() {
        this.collider.on(Contact2DType.BEGIN_CONTACT, (coll1: Collider2D, coll2: Collider2D) => {
            if (coll2.group === physicsGroup.juese) {
                const target = coll2.getComponent(GamePlayer)
                if (target) {
                    target.strike(this.damage)
                    this.colliderMap.set(coll2, () => target.isValid && target.strike(this.damage))
                    this.schedule(this.colliderMap.get(coll2), 0.5)
                }
            } else if (coll2.group === physicsGroup.guaiwu && listenColliderVillain ) {
                /**注意此处默认怪物使用的碰撞机为矩形碰撞机 */
                this.contactVillainSet.add((coll2 as BoxCollider2D))
            }
        })

        this.collider.on(Contact2DType.END_CONTACT, (coll1: Collider2D, coll2: Collider2D) => {
            if (coll2.group === physicsGroup.juese) {
                this.unschedule(this.colliderMap.get(coll2))
            } else if (coll2.group === physicsGroup.guaiwu) {
                this.contactVillainSet.delete((coll2 as BoxCollider2D))
            }
        })
    }

    /**获取攻击角色 */
    getTarget() {
        return this.manageNode.getRandomGamePlayer()
    }

    /**解决怪物碰撞折叠 */
    refuseCollider() {

        if (!this.isValid) { return }

        this.contactVillainSet.forEach(item => {
            if (!item.isValid) {
                this.contactVillainSet.delete(item)
                return
            }

            const [n1, n2] = [this.node, item.node]
            const p = new Vec3(n2.worldPosition.x - n1.worldPosition.x, n2.worldPosition.y - n1.worldPosition.y)
            const p2 = [this.collider.size.width / 2 + item.size.width / 2, this.collider.size.height / 2 + item.size.height / 2]
            const s = [p2[0] - Math.abs(p.x), p2[1] - Math.abs(p.y)]

            if(Math.abs(s[0])<Math.abs(s[1])){
                s[0]=n1.worldPosition.x-n2.worldPosition.x>0?s[0]:-1*s[0]
                n2.setWorldPosition(new Vec3(n2.worldPosition.x-s[0]/2,n2.worldPosition.y))
                n1.setWorldPosition(new Vec3(n1.worldPosition.x+s[0]/2,n1.worldPosition.y))
            }else{
                s[1]=n1.worldPosition.y-n2.worldPosition.y>0?s[1]:-1*s[1]
                n2.setWorldPosition(new Vec3(n2.worldPosition.x,n2.worldPosition.y-s[1]/2))
                n1.setWorldPosition(new Vec3(n1.worldPosition.x,n1.worldPosition.y+s[1]/2))
            }

        })
    }

    /**角色移动 */
    move(dt: number,target:Node) {
        if (target === null) {
          return
        }
        const sp = this.node.getPosition()
        const tp = target.getPosition()
        const x = sp.x - tp.x
        const y = sp.y - tp.y
        const k = Math.sqrt(x * x + y * y)
        if (k < 40) {
          return
        }
        const len = this.speed * dt
        const x1 = x * len / k
        const y1 = y * len / k
        this.node.setPosition(sp.subtract(new Vec3(x1, y1)))
        this.moveDirection = computedDirection(-1 * x1, -1 * y1)

        /**用点检测解决怪物折叠问题 */
        // PhysicsSystem2D.instance.testPoint()
    }

    unmount(): void {
        Villain.onVillainUnmountFn.forEach(item=>item(this))
        Role.prototype.unmount.call(this)
    }

}











    // /**每几帧处理一次怪物碰撞折叠 */
    // markRefuseColliderPosition=true
    // /**在解决怪物重叠的过程中,会发生怪物集体抖动的情况,这里添加节流尝试解决 */
    // refuseColliderPosition(p:Vec3){
    //     if(this.markRefuseColliderPosition===false){
    //         return
    //     }
    //     this.node.setWorldPosition(p)
    //     this.markRefuseColliderPosition=false
    //     this.schedule(()=>{
    //         this.markRefuseColliderPosition=true
    //     },0.1,0)
    // }

    // if(Math.abs(s[0])<Math.abs(s[1])){
    //     s[0]=n1.worldPosition.x-n2.worldPosition.x>0?s[0]:-1*s[0]
    //     n2.getComponent(Villain)?.refuseColliderPosition(new Vec3(n2.worldPosition.x-s[0]/2,n2.worldPosition.y))
    //     n1.getComponent(Villain)?.refuseColliderPosition(new Vec3(n1.worldPosition.x+s[0]/2,n1.worldPosition.y))
    // }else{
    //     s[1]=n1.worldPosition.y-n2.worldPosition.y>0?s[1]:-1*s[1]
    //     n2.getComponent(Villain)?.refuseColliderPosition(new Vec3(n2.worldPosition.x,n2.worldPosition.y-s[1]/2))
    //     n1.getComponent(Villain)?.refuseColliderPosition(new Vec3(n1.worldPosition.x,n1.worldPosition.y+s[1]/2))
    // }
