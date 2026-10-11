// Application service: coordinates domain, repository and events.
import {createBooking,transitionBooking,DomainError} from './booking-core.mjs';
export function createBookingService({repository,events,idFactory}){
  if(!repository||!events||typeof idFactory!=='function')throw new TypeError('Missing service dependency');
  return {
    async list(){return repository.list()},
    async place(request){const booking=createBooking(request,idFactory());await repository.save(booking);events.emit('booking:created',booking);return booking},
    async changeStatus(id,next){const existing=await repository.get(id);if(!existing)throw new DomainError('NOT_FOUND','Booking not found');const updated=transitionBooking(existing,next);await repository.save(updated);events.emit('booking:updated',updated);return updated}
  };
}
