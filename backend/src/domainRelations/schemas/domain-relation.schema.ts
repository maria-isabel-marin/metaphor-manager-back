import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DomainRelationDocument = DomainRelation & Document;

@Schema({ collection: 'domain_relations', timestamps: true })
export class DomainRelation {
  @Prop({ type: Types.ObjectId, ref: 'Domain', required: true })
  domainA: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Domain', required: true })
  domainB: Types.ObjectId;

  @Prop({
    required: true,
    enum: [
      'hypernym',
      'hyponym',
      'co-hyponym',
      'meronym',
      'holonym',
      'syntagmatic',
    ],
  })
  relationType:
    | 'hypernym'
    | 'hyponym'
    | 'co-hyponym'
    | 'meronym'
    | 'holonym'
    | 'syntagmatic';
}

export const DomainRelationSchema =
  SchemaFactory.createForClass(DomainRelation);
