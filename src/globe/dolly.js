import { Object3D, Vector3 } from "three";



export default class Dolly extends Object3D {
    constructor(currentTarget, interpolation = 0) {
        super();
        this.position.copy(currentTarget.clone().multiplyScalar(interpolation));
        this.targetPosition = currentTarget;
        this.velocity = new Vector3();

        this.currentTarget = this.targetPosition;
        this.totalDistance = currentTarget.length();

        this.cutoff = 0.001;
        this.brake = 5;
        this.acceleration = 0.1;
    }

    goTo(interpolation) {
        const target = this.targetPosition.clone().multiplyScalar(interpolation);

        if (this.position.equals(target)) {
            return;
        }

        this.currentTarget = target;

        this.velocity.negate(); // TODO: improve
        return this.update.bind(this);
    }

    update = (state, deltaTime) => {
        const deltaPos = this.currentTarget.clone().sub(this.position);
        const distance = deltaPos.length();
    
        if (distance < this.totalDistance * this.cutoff) {
            this.position.copy(this.currentTarget);
            return false;
        }
    
        const desiredSpeed = distance * Math.min(1, deltaTime * this.brake);
        const currentSpeed = this.velocity.length();
    
        this.velocity = deltaPos.clone().normalize().multiplyScalar(Math.min(desiredSpeed, currentSpeed + this.acceleration * deltaTime));
        
        this.position.add(this.velocity);
    }
}
