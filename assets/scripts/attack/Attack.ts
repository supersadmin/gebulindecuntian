import { _decorator, Component, Node, Vec3, Collider2D, AudioSource, AudioClip, UITransform, Contact2DType, BoxCollider2D, PhysicsSystem2D, resources, Prefab } from 'cc';
import { Role } from '../Role/Role';
import { physicsGroup } from '../other/getDirection';
const { ccclass, property } = _decorator;

/**音频播放对象池 */
const audioSourcePool: AudioSource[] = []


/**子弹类,场景上的飞行物 */
@ccclass('Attack')
export class Attack extends Component {

    /**监听子弹造成伤害的函数,可以用来加分
     * 当子弹类命中造成伤害之前会执行此集合里的函数函数
     */
    static onCauseDamageFn=new Set<(damage:number,t?:Attack)=>number>()

    /**子弹预制体 */
    static getAttackPrefab:(()=>Prefab) =()=>resources.get('prefab/zidan1',Prefab)

    /**子弹飞行速度 */
    _speed: number = 1800
    /**子弹飞行速度 */
    get speed() {
        return this._speed
    }
    set spaad(val: number) {
        this._speed = val
    }

    /**子弹伤害 */
    _damage: number = 5
    /**子弹伤害 */
    get damage() {
        return this._damage
    }
    set damage(val: number) {
        this._damage = val
    }

    /**子弹飞行方向 */
    _moveDirection: Vec3 = new Vec3(1, 1)
    /**子弹飞行方向 */
    get moveDirection() {
        return this._moveDirection
    }
    set moveDirection(val: Vec3) {
        this._moveDirection = val
    }

    /**子弹最长存在时间,单位为秒 */
    _lifeTime: number = 3
    /**子弹最长存在时间,单位为秒 */
    get lifeTime() {
        return this._lifeTime
    }
    set lifeTime(val: number) {
        this._lifeTime = val
    }
    /**攻击间隔 单位ms*/
    _attackInterval = 40
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
    createAudioClip: AudioClip = resources.get('audio/attack/zidan1Create', AudioClip)
    /**子弹移动时播放的音频 */
    moveAudioClip: AudioClip = null
    /**子弹命中时播放的音频 */
    attackAudioClip: AudioClip = resources.get('audio/attack/zidan1Attack', AudioClip)
    /**子弹销毁时播放的音频 */
    destoryAudioClip: AudioClip = null
    /**对撞机组件 */
    collider: Collider2D = null
    /**子弹命中时执行的函数,这个函数实现类似吸血效果的逻辑
     * @param strike 造成的伤害
     */
    hitFn:((strike:Number)=>void)=null

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

    /**对命中的目标造成伤害*/
    causeDamage(target:Role) {
        let d=this.damage
        Attack.onCauseDamageFn.forEach(item=>d=item(d,this))
        /**最终所造成的伤害 */
        let t=target.strike(d)
        this.hitFn&&this.hitFn(t)
        return d 
    }

    /**监听碰撞(发生碰撞的逻辑) */
    listenCollider() {
        this.collider.on(Contact2DType.BEGIN_CONTACT, (coll1: Collider2D, coll2: Collider2D) => {
            if (physicsGroup.guaiwu === coll2.group) {
                const target = coll2.getComponent(Role)
                if (target) {
                    this.playAudio('attackAudioClip')
                    this.causeDamage(target)
                    // this.node.destroy()
                }
            }
        })
    }

    /**节点销毁 */
    unmount() {
        this.playAudio('destoryAudioClip')
        this.unschedule(this.timeoutFn)
        this.node?.destroy()
    }

    /**播放音频 */
    playAudio(n: 'destoryAudioClip' | 'attackAudioClip' | 'moveAudioClip' | 'createAudioClip') {
        if (this[n] === null) { return }
        const audioSource = audioSourcePool.pop() || new AudioSource()
        audioSource.clip = this[n]
        audioSource.play()
        this.schedule(() => {
            if (!audioSource.playing) {
                audioSourcePool.push(audioSource)
            }
        }, audioSource.duration + 0.1)
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
