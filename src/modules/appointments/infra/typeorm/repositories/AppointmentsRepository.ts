import { getRepository, Repository, Raw } from 'typeorm';

import IAppointmentsRepository from '@modules/appointments/repositories/IAppointmentsRepository';
import ICreateAppointmentDTO from '@modules/appointments/dtos/ICreateAppointmentDTO';
import IFindAllInMonthFromProviderDTO from '../../../dtos/IFindAllInMonthFromProviderDTO';
import IFindAllInDayFromProviderDTO from '../../../dtos/IFindAllInDayFromProviderDTO';

import Appointment from '../entities/Appointment';

class AppointmentsRepository implements IAppointmentsRepository {
  private ormRepository: Repository<Appointment>;

  constructor() {
    this.ormRepository = getRepository(Appointment);
  }

  public async findByDate(
    date: Date,
    provider_id: string,
  ): Promise<Appointment | undefined> {
    const findAppointment = await this.ormRepository.findOne({
      where: { date, provider_id },
    });
    return findAppointment;
  }

  public async findAllInMonthFromProvider({
    provider_id,
    year,
    month,
  }: IFindAllInMonthFromProviderDTO): Promise<Appointment[]> {
    const parserdMonth = String(month).padStart(2, '0');

    const appointments = await this.ormRepository.find({
      where: {
        provider_id,
        date: Raw(
          (dateFieldName) =>
            `to_char(${dateFieldName}, 'MM-YYYY') = '${parserdMonth}-${year}'`,
        ),
      },
    });

    return appointments;
  }

  public async findAllInDayFromProvider({
    provider_id,
    day,
    year,
    month,
  }: IFindAllInDayFromProviderDTO): Promise<Appointment[]> {
    const parserdDay = String(day).padStart(2, '0');
    const parserdMonth = String(month).padStart(2, '0');

    const appointments = await this.ormRepository.find({
      where: {
        provider_id,
        date: Raw(
          (dateFieldName) =>
            `to_char(${dateFieldName}, 'DD-MM-YYYY') = '${parserdDay}-${parserdMonth}-${year}'`,
        ),
      },
    });

    return appointments;
  }

  public async create({
    provider_id,
    user_id,
    date,
  }: ICreateAppointmentDTO): Promise<Appointment> {
    const appointment = this.ormRepository.create({
      provider_id,
      user_id,
      date,
    });

    await this.ormRepository.save(appointment);

    return appointment;
  }
}

export default AppointmentsRepository;
