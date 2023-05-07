import { _decorator, Component, Node, Vec3, director, Collider2D, AudioSource, AudioClip, UITransform, Contact2DType, BoxCollider2D, PhysicsSystem2D } from 'cc';
import { Role } from '../Role/Role';
import { physicsGroup } from '../other/getDirection';
const { ccclass, property } = _decorator;

/**子弹类,场景上的飞行物 */
@ccclass('Attack')
export class Attack extends Component {

    _speed: number = 400
    /**子弹飞行速度 */
    get speed() {
        return this._speed
    }
    set spaad(val: number) {
        this._speed = val
    }

    _damage: number = 5
    /**子弹伤害 */
    get damage() {
        return this._damage
    }
    set damage(val: number) {
        this._damage = val
    }

    _moveDirection: Vec3 = new Vec3(1, 1)
    /**子弹飞行方向 */
    get moveDirection() {
        return this._moveDirection
    }
    set moveDirection(val: Vec3) {
        this._moveDirection = val
    }

    _lifeTime: number = 3
    /**子弹最长存在时间,单位为秒 */
    get lifeTime() {
        return this._lifeTime
    }
    set lifeTime(val: number) {
        this._lifeTime = val
    }

    _attackInterval = 240
    /**攻击间隔 单位ms*/
    get attackInterval() {
        return this._attackInterval
    }
    set attackInterval(val: number) {
        this._attackInterval = val
    }

    /**初始世界坐标 */
    worldPosition: Vec3 = new Vec3()
    /**定时销毁子弹节点的定时器 */
    timeoutFn: Function = null
    /**子弹创建时播放的音频 */
    createAudioClip: AudioClip = null
    /**子弹移动时播放的音频 */
    moveAudioClip: AudioClip = null
    /**子弹命中时播放的音频 */
    attackAudioClip: AudioClip = null
    /**子弹销毁时播放的音频 */
    destoryAudioClip: AudioClip = null
    /**对撞机组件 */
    collider: Collider2D = null

    /**初始化攻击
     * @param direction 飞行方向 
     * @param worldPosition 子弹世界坐标
     * @param physicsGroup 物理碰撞分组
     * @param leadDamage 要增加的角色伤害
     */
    init(direction: Vec3, worldPosition: Vec3, physicsGroup: number, leadDamage: number = 0) {
        this.damage += leadDamage
        this.moveDirection = direction
        this.worldPosition = worldPosition
        this.node.angle = computedDeg(this.moveDirection.x, this.moveDirection.y)
        this.node.setWorldPosition(this.worldPosition)
        this.collider = this.getComponent(Collider2D)
        this.collider.group = physicsGroup
    }


    start() {

        this.schedule(this.timeoutFn = () => {
            this.unmount()
        }, this.lifeTime)
        this.playAudio('createAudioClip')

        const transform = this.getComponent(UITransform)
        const [w, h] = [transform.width, transform.height]
        transform.height = 0
        transform.width = 0

        this.scheduleOnce(function () {
            transform.height = h
            transform.width = w
        }, 0);

        this.listenCollider()

    }

    update(dt: number) {
        this.move(dt)
    }

    /**子弹飞行 */
    move(dt: number) {
        const len = dt * this.speed
        const p = Math.sqrt(this.moveDirection.x ** 2 + this.moveDirection.y ** 2)
        const x = len * this.moveDirection.x / p
        const y = len * this.moveDirection.y / p
        this.node.setWorldPosition(this.node.getWorldPosition().add(new Vec3(x, y)))
    }

    /**子弹命中后进行加分操作,返回值为要加的分数 */
    addFraction() {
        return this.damage
    }

    /**开始监听碰撞 */
    listenCollider() {
        this.collider.once(Contact2DType.BEGIN_CONTACT, (coll1: Collider2D, coll2: Collider2D) => {
            if (physicsGroup.guaiwu===coll2.group) {
                const target = coll2.getComponent(Role)
                if (target) {
                    target.strike(this.damage)
                }
            }
        })
    }

    /**节点销毁 */
    unmount() {
        this
        this.playAudio('destoryAudioClip')
        this.unschedule(this.timeoutFn)
        this.node?.destroy()
    }

    /**播放音频 */
    playAudio(n: 'destoryAudioClip' | 'attackAudioClip' | 'moveAudioClip' | 'createAudioClip') {
        if (this[n] === null) { return }
        const audioSource = new AudioSource()
        audioSource.clip = this[n]
        audioSource.play()
    }

}

/**计算向量与x轴正方向形成的夹角 */
const computedDeg = (x: number, y: number) => {
    let deg = 180 * Math.atan(Math.abs(y) / Math.abs(x)) / Math.PI
    if (x >= 0 && y >= 0) {
        return deg
    } else if (x >= 0 && y <= 0) {
        return -1 * deg
    } else if (x <= 0 && y <= 0) {
        return 180 + deg
    } else if (x <= 0 && y >= 0) {
        return 180 - deg
    }
}
