import {ObjectId} from "mongodb";

export interface BiodataInput {
  biodataId: number;
  gender: string;
  name: string;
  profileImage: string;
  dob: string;
  height: string;
  weight: string;
  age: number;
  occupation: string;
  race: string;
  fathersName: string;
  mothersName: string;
  permanentDivision: string;
  presentDivision: string;
  expectedPartnerAge: string;
  expectedPartnerHeight: string;
  expectedPartnerWeight: string;
  contactEmail: string;
  mobileNumber: string;
  premium: boolean;
}

export interface Biodata extends BiodataInput {
  _id: ObjectId;
}
