import { _decorator, Node, Vec3, Camera,director, Prefab,instantiate,Sprite } from 'cc';
import { Role } from './Role';
import { Direction } from '../other/Direction';
import { computedDirection, mapSize,directionIndex,physicsGroup } from '../other/getDirection';
import { ManageGame1 } from '../manage/ManageGame1';
import { Attack } from '../attack/Attack';

const { ccclass, property } = _decorator;

/**受玩家控制的角色应该继承此类 */
@ccclass('GamePlayer')
export class GamePlayer extends Role {

    /**统一管理节点以预制体等资源的组件 */
    @property({ type: ManageGame1 })
    manageNode: ManageGame1 = null

    /**角色攻击朝向 */
    attackDirection: string = null

    /**清除攻击朝向的函数
     * 角色往左走但是又在攻击右边的角色时
     * 此时的角色应该面朝右边
     */
    clearDirection: Function = null

    /**方向键按钮对象,控制角色移动*/
    moveDirectionNode: Node = null

    /**方向键按钮对象,控制角色攻击*/
    attackDirectionNode: Node = null

    /**方向键的脚本组件 */
    moveScript: Direction = null

    /**攻击键的脚本组件*/
    attackScript: Direction = null

    /**对准玩家控制的角色的相机 */
    camera: Camera = null

    /**攻击冷却时间 */
    attackInterval = 100

    /**攻击子弹预制体 */
    zidan1:Prefab=null

    /**放置子弹的层级 */
    bulletLayer:Node=null

    start() {
        this.bulletLayer=this.manageNode.bulletLayer
        this.zidan1=this.manageNode.zidan1
        this.camera = this.manageNode.camera
        this.moveDirectionNode = this.manageNode.moveDirectionNode
        this.attackDirectionNode = this.manageNode.attackDirectionNode

        Role.prototype.start.call(this)

        this.clearDirection = this.antiShake(() => this.attackDirection = null, 0.4)
        this.moveScript = this.moveDirectionNode.getComponent(Direction)
        this.attackScript=this.attackDirectionNode.getComponent(Direction)
        
        this.startAttack()
        this.setCamera()

        this.manageNode.gamePlayerSet.add(this.node)

    }

    update(deltaTime: number) {

        if (this.moveScript.level !== 0) {
            this.move(deltaTime)
            this.animation.getState('move').isPlaying || this.animation.play()
            this.animation.getState('move').speed=this.moveScript.level
        } else {
            if (this.animation.getState('move').isPlaying) {
                this.animation.stop()
                this.frameEvent(1)
            }
        }
    }

    /** 为函数添加防抖
     * @param time 单位为秒
    */
    antiShake(fn: Function, time: number) {
        let timeEnd = null
        return () => {
            clearTimeout(timeEnd)
            timeEnd = setTimeout(fn, time * 1000)
        }
    }

    /**控制角色移动 */
    move(dt: number) {

        const [n, m] = [this.moveDirectionNode.position.x, this.moveDirectionNode.position.y]
        const len = dt * this.speed * this.moveScript.level
        const len2 = Math.sqrt(n ** 2 + m ** 2)

        let offsetX = len * n / len2
        let offsetY = len * m / len2

        this.moveDirection = computedDirection(offsetX, offsetY)
        const p = this.node.position

        let [x, y] = [p.x + offsetX, p.y + offsetY]
        if (Math.abs(x) > mapSize.radiusX) {
            x = x > 0 ? mapSize.radiusX : (-1 * mapSize.radiusX)
        }
        if (Math.abs(y) > mapSize.radiusY) {
            y = y > 0 ? mapSize.radiusY : (-1 * mapSize.radiusY)
        }

        this.node.setPosition(new Vec3(x, y, 0))
        this.setCamera()
    }

    /**调用相机跟随 */
    setCamera() {
        const p = this.node.position
        this.camera.node.setPosition(new Vec3(p.x, p.y - 60, 1000))
    }

    /**开始攻击 */
    startAttack() {
        this.schedule((dt: number) => {
            /**dt为距离上一次执行说间隔的事件,单位为秒 */
            this.attackInterval -= (dt * 1000)
            if (this.attackInterval > 0|| !this.attackScript.touch ) {
                return
            }
            const attackDirection=new Vec3(this.attackDirectionNode.position.x,this.attackDirectionNode.position.y)
            this.attack(attackDirection,this.zidan1)
        }, 0.08)
    }

    /**进行攻击执行的逻辑
     * @param attackDirection 攻击的方向
     * @param attackPrefab 攻击子弹的预制体
     */
    attack(attackDirection:Vec3,attackPrefab:Prefab) {
        const d = instantiate(attackPrefab)
        const zd = d.getComponent(Attack)
        const dir = attackDirection

        /**为子弹添加随机偏移 */
        dir.x = dir.x * rnBox(this.moveScript.level)
        dir.y = dir.y * rnBox(this.moveScript.level)

        this.bulletLayer.addChild(d)
        zd.init(dir,this.node.worldPosition,physicsGroup.juesezidan,this.damage)

        this.attackDirection = computedDirection(dir.x, dir.y)
        this.frameEvent(1)
        this.clearDirection()
        this.attackInterval = zd.attackInterval * (this.moveScript.level || 1)
    }

    frameEvent(n: number) {
        const d = this.attackDirection || this.moveDirection
        if (d === null) { return }
        this.node.getComponent(Sprite).spriteFrame = this.spriteAtlas.spriteFrames[this.beforeName + '_' + directionIndex[d][n]]
    }

    /**角色死亡函数 */
    death() {
        Role.prototype.death.call(this)
        this.manageNode.gamePlayerSet.delete(this.node)
    }

}


function rnBox(n) {
    if (n === 0) {
        return 1
    } else if (n <= 1) {
        return randomNumber(0.1)
    } else if (n <= 2) {
        return randomNumber(0.2)
    }
    return 1
}

/**生成随机数 */
function randomNumber(n: number) {
    const t = (Math.random() - 0.5) * n * 2
    return 1 - t
}
