import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import Company from './company.schema';
import Contact from './company.schema/contact.schema';
import Address from './company.schema/address.schema';
import Legal from './company.schema/legal.schema';
import Office from './company.schema/office.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<typeof Company>,
    @InjectModel(Contact.name)
    private contactModel: Model<typeof Contact>,
    @InjectModel(Address.name)
    private addressModel: Model<typeof Address>,
    @InjectModel(Legal.name)
    private legalModel: Model<typeof Legal>,
    @InjectModel(Office.name)
    private officeModel: Model<typeof Office>,
  ) {}

  async create(createCompany): Promise<any> {
    const session = await this.companyModel.startSession();
    session.startTransaction();

    try {
      const { about, contactDetails, legalInformation, offices } =
        createCompany;

      const legalInfo = await this.createLegalInformation(
        legalInformation,
        session,
      );

      const company = new this.companyModel({
        ...about,
        legalInformation: legalInfo._id,
        user: new mongoose.Types.ObjectId(createCompany.user),
      });

      const savedCompany = await company.save({ session });

      await Promise.all(
        contactDetails.map((contact) =>
          this.createContact(contact, savedCompany._id, session),
        ),
      );

      await Promise.all(
        offices.map((office) =>
          this.createOffice(office, savedCompany._id, session),
        ),
      );

      await session.commitTransaction();
      session.endSession();

      return savedCompany;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async createContact(contactDetails, companyId, session): Promise<any> {
    const contact = new this.contactModel({
      ...contactDetails,
      company: companyId,
    });
    return contact.save({ session });
  }

  async createOffice(officeDetails, companyId, session): Promise<any> {
    const { address, contact } = officeDetails;
    const { _id: addressId } = await this.createAddress(address, null, session);
    const { _id: contactId } = await this.createContact(contact, null, session);
    const office = new this.officeModel({
      address: addressId,
      contact: contactId,
      company: companyId,
    });
    return office.save({ session });
  }

  async createLegalInformation(legalInfoDetails, session): Promise<any> {
    const { registrationAddress, ...rest } = legalInfoDetails;
    const { _id } = await this.createAddress(
      registrationAddress,
      null,
      session,
    );
    const legalInfo = new this.legalModel({
      ...rest,
      registrationAddress: _id,
    });
    return legalInfo.save({ session });
  }

  async createAddress(addressDetails, companyId, session): Promise<any> {
    const address = new this.addressModel({
      ...addressDetails,
      company: companyId,
    });
    return address.save({ session });
  }

  async find(userId) {
    const companies = await this.companyModel.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: this.contactModel.collection.name,
          localField: '_id',
          foreignField: 'company',
          as: 'contactDetails',
        },
      },
      {
        $lookup: {
          from: this.legalModel.collection.name,
          localField: 'legalInformation',
          foreignField: '_id',
          as: 'legalInformation',
        },
      },
      {
        $lookup: {
          from: this.officeModel.collection.name,
          localField: '_id',
          foreignField: 'company',
          as: 'offices',
        },
      },
      {
        $unwind: '$offices',
      },
      {
        $lookup: {
          from: this.contactModel.collection.name,
          localField: 'offices.contact',
          foreignField: '_id',
          as: 'offices.contact',
        },
      },
      {
        $lookup: {
          from: this.addressModel.collection.name,
          localField: 'offices.address',
          foreignField: '_id',
          as: 'offices.address',
        },
      },
      {
        $group: {
          _id: '$_id',
          about: { $first: '$$ROOT' },
          contactDetails: { $first: '$contactDetails' },
          legalInformation: { $first: '$legalInformation' },
          offices: { $push: '$offices' },
        },
      },
    ]);

    if (companies.length === 0) {
      return null;
    }

    const company = companies[0];
    const registrationAddressID =
      company.legalInformation[0].registrationAddress;
    const registrationAddress = await this.addressModel.findById(
      registrationAddressID,
    );
    company.legalInformation[0].registrationAddress = registrationAddress;

    return {
      about: {
        employeeStrength: company.about.employeeStrength,
        name: company.about.name,
        industry: company.about.industry,
        description: company.about.description,
        website: company.about.website,
      },
      contactDetails: company.contactDetails,
      legalInformation: company.legalInformation[0],
      offices: company.offices,
    };
  }

  async remove(userId: mongoose.Types.ObjectId): Promise<any> {
    const session = await this.companyModel.startSession();
    session.startTransaction();

    try {
      const companies = await this.companyModel.findOneAndDelete(
        { user: userId },
        {
          session,
        },
      );

      if (!companies) {
        throw new NotFoundException('Company not found');
      }

      const company = JSON.parse(JSON.stringify(companies));

      await this.contactModel.deleteMany({ company: company._id }, { session });
      await this.officeModel.deleteMany({ company: company._id }, { session });
      await this.legalModel.deleteOne(
        { _id: company.legalInformation },
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return company;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
