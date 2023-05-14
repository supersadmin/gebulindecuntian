import { _decorator, Component, Node } from 'cc';
import { SkillIndicator } from './SkillIndicator';
import { Skill } from './Skill';
const { ccclass, property } = _decorator;

/**当技能预释放时,用该脚本控制显示在角色身上的技能释放指示器 */
@ccclass('RoleSkillIndicator')
export class RoleSkillIndicator extends Component {


    /**技能释放指示器 */
    skillIndicator:SkillIndicator=null
    /**预释放的技能,这个属性的值应该为一个类,而不是一个实例对象 */
    skill:(typeof Skill)=null

    start() {
        
    }

    update(deltaTime: number) {
        // this.skillIndicator.
    }
}


