import { BaseEntity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from 'typeorm'
import { IsString, Length, MinLength, IsNotEmpty } from 'class-validator'
import { ObjectType, InputObjectType, Field } from 'graphql-schema-decorator'
import { GraphQLID, GraphQLString } from 'graphql'

@InputObjectType({ description: 'Partial Blog Post Input Type' })
export class BlogPostInput {
    @Field({ nonNull: true })
    title: string

    @Field({ nonNull: true })
    body: string
}

@ObjectType({ description: 'Blog Posts' })
@Entity('blog_posts')
export class BlogPost extends BaseEntity {

    @Field({
        type: GraphQLID,
        nonNull: true,
    })
    @PrimaryGeneratedColumn()
    id?: number

    @Field({
        type: GraphQLString,
    })
    @IsNotEmpty()
    @IsString()
    @Length(3, 32)
    @Column({ type: 'varchar' })
    title: string

    @Field({
        type: GraphQLString,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(150)
    @Column({ type: 'text' })
    body: string

    @Field({
        type: GraphQLString,
    })
    @CreateDateColumn()
    createdAt: Date

    @Field({
        type: GraphQLString,
    })
    @UpdateDateColumn()
    updatedAt: Date
}