export class MemoryRepository{
 constructor(){this.users=new Map();this.bookings=new Map()}
 findUserByEmail(email){return [...this.users.values()].find(user=>user.email===email)}
 saveUser(user){this.users.set(user.id,user)}
 saveBooking(booking){this.bookings.set(booking.id,booking)}
 findBooking(id){return this.bookings.get(id)}
 listBookings(userId){return [...this.bookings.values()].filter(booking=>booking.userId===userId)}
}
