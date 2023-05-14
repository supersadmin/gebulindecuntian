import { _decorator, Component, EventTouch, instantiate, Node, Prefab, resources, UIOpacity, UITransform, Vec3 } from 'cc';
import { Role } from '../Role/Role';
import { myFind } from '../other/getDirection';
import { ManageGame1 } from '../manage/ManageGame1';
import { Skill } from './Skill';
import { SkillCd } from './SkillCd';
const { ccclass, property } = _decorator;

/**技能释放指示器 */
@ccclass('SkillIndicator')
export class SkillIndicator extends Component {

    /**显示技能指示器的预制体 */
    skillIndicatorPrefab: Prefab = null

    /**显示在角色身上的技能指示器预制体 */
    roleSkillIndicatorPrefab: Prefab = null

    /**监听相对位置变化的函数列表 */
    onRelativeFn=new Set<Function>()
    /**当前滑动的相对位置 */
    _relative: Vec3 = null
    /**当前滑动的相对位置 */
    get relative(){
        return this._relative
    }
    set relative(val:Vec3){
        this._relative=val
        this.onRelativeFn.forEach(item=>item())
    }
    /**显示点击位置的按钮 */
    slider: Node = null
    /**显示取消释放的按钮 */
    giveUp: Node = null
    /**控制技能的角色 */
    _role: Role = null
    /**控制技能的角色 */
    get role(){
        return this._role
    }
    set role(val:Role){
        this._role=val
        val.isValid&&this.roleSkillIndicatorInit()
    }

    /**添加在角色身上的技能释放指示器节点 */
    roleN:Node=null
    /**场景节点管理 */
    manageNode:ManageGame1=null
    /**要释放的技能 */
    skill:typeof Skill=null
    /**当滑动到取消技能上方时应该显示为半透明 */
    opacity=255

    protected onLoad(): void {
        this.skillIndicatorPrefab = resources.get('prefab/SkillIndicator/skillIndicator', Prefab)
        this.roleSkillIndicatorPrefab = resources.get('prefab/SkillIndicator/roleSkillIndicatorBox', Prefab)
        this.manageNode=myFind('manageNode').getComponent(ManageGame1)
    }

    start() {
        this.skillIndicatorInit()
    }

    /**添加在技能图标上的技能释放指示器初始化 */
    skillIndicatorInit(){
        const n = instantiate(this.skillIndicatorPrefab)
        this.node.addChild(n)
        n.active = false
        this.slider = n.getChildByName('slider')
        this.giveUp = n.getChildByName('giveUp')

        /**对释放技能函数进行封装,添加cd逻辑 */
        const releaseSkill=()=>{
            if(this.role.isValid){
                this.skill.queryFn(this.role,this.relative)
                this.node.off(Node.EventType.TOUCH_START,touchStartFn)
                this.node.off(Node.EventType.TOUCH_MOVE, touchMoveFn)
                this.node.off(Node.EventType.TOUCH_END, upFn)
                this.node.off(Node.EventType.TOUCH_CANCEL, upFn)
                this.scheduleOnce(()=>{
                    this.node.on(Node.EventType.TOUCH_START,touchStartFn)
                    this.node.on(Node.EventType.TOUCH_MOVE, touchMoveFn)
                    this.node.on(Node.EventType.TOUCH_END, upFn)
                    this.node.on(Node.EventType.TOUCH_CANCEL, upFn)
                },this.skill.cd)
                this.node.getComponent(SkillCd).startCooling(this.skill.cd)
            }
        }

        /**点击滑动执行的函数 */
        const touchMoveFn=(e:EventTouch)=>{
            let touchPos = e.touch.getUILocation()
            this.slider.setWorldPosition(new Vec3(touchPos.x, touchPos.y))
            const [x, y] = computedDeg(this.slider.position.x, this.slider.position.y, 120)
            this.slider.setPosition(new Vec3(x, y))
            this.relative = new Vec3(x, y)
            const distance = Vec3.distance(this.giveUp.getWorldPosition(), new Vec3(touchPos.x, touchPos.y))
            this.opacity=distance <= 50?100:255
        }
        /**点击释放执行的函数 */
        const upFn=(e:EventTouch)=>{
            const distance = Vec3.distance(this.giveUp.getWorldPosition(), new Vec3(e.getUILocation().x, e.getUILocation().y))
            if (distance > 50) {
                /**释放技能 */
                releaseSkill()
            }
            this.relative=null
            n.active = false
        }
        /**点击事件发生时执行的函数 */
        const touchStartFn=(e: EventTouch) => {
            n.active = true
            touchMoveFn(e)
        }

        this.node.on(Node.EventType.TOUCH_START,touchStartFn)
        this.node.on(Node.EventType.TOUCH_MOVE, touchMoveFn)
        this.node.on(Node.EventType.TOUCH_END, upFn)
        this.node.on(Node.EventType.TOUCH_CANCEL, upFn)
    }

    /**添加在角色身上的技能释放指示器节点初始化 */
    roleSkillIndicatorInit() {
        this.roleN=instantiate(this.roleSkillIndicatorPrefab)
        this.manageNode.skillIndicatorLayer.addChild(this.roleN)
        this.roleN.active=false
        this.roleN.getComponent(UITransform).height=this.skill.radius*2
        this.roleN.getComponent(UITransform).width=this.skill.radius*2
        const roleSkillIndicator=this.roleN.getChildByName('roleSkillIndicator')
        if(this.skill.sliderType===0){
            roleSkillIndicator.active=false
        }

        let fn:Function=null
        this.onRelativeFn.add(fn=()=>{
            if(this.relative===null){
                this.roleN.active=false
                return
            }else{
                this.roleN.active=true
            }
            if(this.skill.sliderType===1){
                roleSkillIndicator.angle=computedDeg2(this.relative.x,this.relative.y)
            }else if(this.skill.sliderType===2){
                roleSkillIndicator.angle=computedDeg2(this.relative.x,this.relative.y)
                roleSkillIndicator.scale=new Vec3(Math.sqrt(this.relative.x**2+this.relative.y**2)/120*2,1)
            }
            this.roleN.getComponent(UIOpacity).opacity=this.opacity
        })
        
        this.role.onUnmountBeforeFn.add(()=>{
            this.roleN.destroy()
            this.onRelativeFn.delete(fn)
        })
    }

    update() {
        this.roleN?.active&&this.roleN.setWorldPosition(this.role.node.getWorldPosition())
    }

}

/**通过滑动的位置来计算移动按钮应该显示的位置 */
const computedDeg = (x: number, y: number, radius: number) => {
    const r = Math.sqrt(x * x + y * y)
    if (r <= radius) {
        return [x, y]
    } else {
        return [radius * x / r, radius * y / r]
    }
}


/**计算向量与x轴正方向形成的夹角 */
const computedDeg2 = (x: number, y: number) => {
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
