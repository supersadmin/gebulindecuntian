import { _decorator, Component, Node, Vec3 } from 'cc';
import { Role } from '../Role/Role';
const { ccclass, property } = _decorator;


/**技能类组件的父类 */
@ccclass('Skill')
export class Skill extends Component {
    /**释放技能的对象 */
    targetRole: Role = null
    /**角色技能指示器范围 */
    static radius = 50
    /**是否显示角色身上的技能指示滑块
     * 0 -不显示
     * 1 -指示方向
     * 2 -指示位置
     */
    static sliderType:0|1|2 = 0
    /**技能冷却时间单位s */
    static cd = 25
    /**图标路径 */
    static spriteFramePath: string = 'icon/icon/Icon5'

    /**执行该函数即释放技能
     * @param role 释放技能的角色
     * @param relative 技能释放指示器释放时的位置
     */
    static queryFn: (role: Role, relative: Vec3) => void
}


