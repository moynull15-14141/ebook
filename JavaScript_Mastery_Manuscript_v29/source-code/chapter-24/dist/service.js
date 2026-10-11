import { catalog, calculateTotal, parseBookingInput } from './domain.js';
export class InMemoryBookingRepository {
    data = new Map();
    findById(id) { return this.data.get(id); }
    save(booking) { this.data.set(booking.id, booking); }
    list() { return [...this.data.values()]; }
}
export class BookingService {
    repository;
    packages;
    constructor(repository, packages = catalog) {
        this.repository = repository;
        this.packages = packages;
    }
    create(raw) {
        const parsed = parseBookingInput(raw);
        if (!parsed.ok)
            return parsed;
        const input = parsed.value;
        if (this.repository.findById(input.id))
            return { ok: false, error: { code: 'DUPLICATE_ID', message: 'Booking ID already exists' } };
        const pkg = this.packages.find(p => p.id === input.packageId);
        if (!pkg)
            return { ok: false, error: { code: 'PACKAGE_NOT_FOUND', message: 'Package not found' } };
        const booking = { id: input.id, packageId: pkg.id, customerName: input.customerName, travelers: input.travelers, totalBDT: calculateTotal(pkg.priceBDT, input.travelers), currency: 'BDT', status: 'pending' };
        this.repository.save(booking);
        return { ok: true, value: booking };
    }
    changeStatus(id, next) {
        const booking = this.repository.findById(id);
        if (!booking)
            return { ok: false, error: { code: 'INVALID_INPUT', message: 'Booking not found' } };
        const allowed = { pending: ['confirmed', 'cancelled'], confirmed: ['cancelled'], cancelled: [] };
        if (!allowed[booking.status].includes(next))
            return { ok: false, error: { code: 'INVALID_TRANSITION', message: 'Status transition not allowed' } };
        const updated = { ...booking, status: next };
        this.repository.save(updated);
        return { ok: true, value: updated };
    }
    list() { return this.repository.list(); }
}
