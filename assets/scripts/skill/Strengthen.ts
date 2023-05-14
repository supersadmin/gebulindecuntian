import { _decorator, Tween, Vec3 } from 'cc';
import { Role } from '../Role/Role';
import { Skill } from './Skill';
const { ccclass, property } = _decorator;

/**强化角色的技能 */
export class Strengthen extends Skill {

    /**技能冷却时间单位s */
    static cd=25
    /**图标路径 */
    static spriteFramePath:string='icon/icon/Icon5'

    static queryFn(role:Role,relative:Vec3){
        role.addComponent(Strengthen)
    }

    start(){
        this.targetRole=this.node.getComponent(Role)
        const fn=val=>val*1.3
        this.targetRole.onGetSpeedFn.add(fn)
        this.targetRole.onGetDamageFn.add(fn)
        
        new Tween(this.node).to(0.2,{
            scale:new Vec3(1.2,1.2)
        }).start()

        this.scheduleOnce(()=>{
            this.targetRole.onGetSpeedFn.delete(fn)
            this.targetRole.onGetDamageFn.delete(fn)
            new Tween(this.node).to(0.2,{
                scale:new Vec3(1,1)
            }).start()
            this.destroy()
        },15)
    }
    
}
