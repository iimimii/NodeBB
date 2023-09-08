
import validator from 'validator';
import * as db from '../database';
import * as meta from '../meta';
import * as plugins from '../plugins';
import * as utils from '../utils';

// const validator = require('validator');

// const db = require('../database');
// const meta = require('../meta');
// const plugins = require('../plugins');
// const utils = require('../utils');

const intFields = [
    'cid', 'parentCid', 'disabled', 'isSection', 'order',
    'topic_count', 'post_count', 'numRecentReplies',
    'minTags', 'maxTags', 'postQueue', 'subCategoriesPerPage',
];

// Define the Category interface
interface Category {
    // referenced chat gpt to find how to define a unique interface
    name?: string;
    color?: string;
    bgColor?: string;
    backgroundImage?: string;
    imageClass?: string;
    class?: string;
    link?: string;
    icon?: string;
    totalPostCount?: number;
    topic_count?: number;
    totalTopicCount?: number;
    description?: string;
    descriptionParsed?: string;
    post_count?: number;
    fieldName?: string;
    field? : string;
    fields?: string;
    getAllCidsFromSet: number[];

    // Add other properties as needed
  }

const Categories = {
    getCategoriesFields: async function (cids: number[], fields: string): Promise<Category[]> {
        if (!Array.isArray(cids) || !cids.length) {
            return [];
        }


        const keys = cids.map(cid => `category:${cid}`);
        const categories = await db.getObjects(keys, fields);
        const result = await plugins.hooks.fire('filter:category.getFields', {
            cids: cids,
            categories: categories,
            fields: fields,
            keys: keys,
        });
        result.categories.forEach(category => modifyCategory(category, fields));
        return result.categories;
    },


    getCategoryData: async function (cid: number): Promise<Category | null> {
        const fields = 'desiredFields';
        const categories = await Categories.getCategoriesFields([cid], fields);
        return categories && categories.length ? categories[0] : null;
    },

    getCategoriesData: async function (cids: number[]): Promise<Category[]> {
        const fields = 'desiredFields';
        return await Categories.getCategoriesFields(cids, fields);
    },

    getCategoryField: async function (cid: number, field: string): Promise<any | null> {
        const category = await Categories.getCategoryFields(cid, field);
        return category ? category[field] : null;
    },
    getCategoryFields: async function (cid: number, fields: string): Promise<Category | null> {
        const categories = await Categories.getCategoriesFields([cid], fields);
        return categories ? categories[0] : null;
    },


    // getAllCategoryFields: async function (fields: string): Promise<Category[]> {
    //     const cids = await Categories.getAllCidsFromSet('categories:cid');
    //     return await Categories.getCategoriesFields(cids, fields);
    // },
    setCategoryField: async function (cid: number, field: string, value: number): Promise<void> {
        await db.setObjectField(`category:${cid}`, field, value);
    },
    incrementCategoryFieldBy: async function (cid: number, field: string, value: number): Promise<void> {
        await db.incrObjectFieldBy(`category:${cid}`, field, value);
    },
};

// Export the Categories module
export default Categories;



// module.exports = function (Categories) {
//     Categories.getCategoriesFields = async function (cids: number[], fields: string) {
//         if (!Array.isArray(cids) || !cids.length) {
//             return [];
//         }


//         const keys = cids.map(cid => `category:${cid}`);
//         const categories = await db.getObjects(keys, fields);
//         const result = await plugins.hooks.fire('filter:category.getFields', {
//             cids: cids,
//             categories: categories,
//             fields: fields,
//             keys: keys,
//         });
//         result.categories.forEach(category => modifyCategory(category, fields));
//         return result.categories;
//     };

//     Categories.getCategoryData = async function (cid: number) {
//         const categories = await Categories.getCategoriesFields([cid], []);
//         return categories && categories.length ? categories[0] : null;
//     };



//     Categories.getCategoriesData = async function (cids: number) {
//         return await Categories.getCategoriesFields(cids, []);
//     };

//     Categories.getCategoryField = async function (cid: number, field: string) {
//         const category = await Categories.getCategoryFields(cid, [field]);
//         return category ? category[field] : null;
//     };

//     Categories.getCategoryFields = async function (cid: number, fields: string) {
//         const categories = await Categories.getCategoriesFields([cid], fields);
//         return categories ? categories[0] : null;
//     };

//     Categories.getAllCategoryFields = async function (fields: string) {
//         const cids = await Categories.getAllCidsFromSet('categories:cid');
//         return await Categories.getCategoriesFields(cids, fields);
//     };

//     Categories.setCategoryField = async function (cid: number, field: string, value: number) {
//         await db.setObjectField(`category:${cid}`, field, value);
//     };

//     Categories.incrementCategoryFieldBy = async function (cid: number, field: string, value: number) {
//         await db.incrObjectFieldBy(`category:${cid}`, field, value);
//     };
// };




function defaultIntField(category: Category, fields: string, fieldName: string, defaultField: string) {
    if (!fields.length || fields.includes(fieldName)) {
        const useDefault = !category.hasOwnProperty(fieldName) ||
            category[fieldName] === null ||
            category[fieldName] === '' ||
            !utils.isNumber(category[fieldName]);



        category[fieldName] = useDefault ? meta.config[defaultField] : category[fieldName];
    }
}

function modifyCategory(category: Category, fields: string) {
    if (!category) {
        return;
    }

    defaultIntField(category, fields, 'minTags', 'minimumTagsPerTopic');
    defaultIntField(category, fields, 'maxTags', 'maximumTagsPerTopic');
    defaultIntField(category, fields, 'postQueue', 'postQueue');

    db.parseIntFields(category, intFields, fields);

    const escapeFields = ['name', 'color', 'bgColor', 'backgroundImage', 'imageClass', 'class', 'link'];
    escapeFields.forEach((field) => {
        if (category.hasOwnProperty(field)) {
            category[field] = validator.escape(String(category[field] || ''));
        }
    });

    if (category.hasOwnProperty('icon')) {
        category.icon = category.icon || 'hidden';
    }

    if (category.hasOwnProperty('post_count')) {
        category.totalPostCount = category.post_count;
    }

    if (category.hasOwnProperty('topic_count')) {
        category.totalTopicCount = category.topic_count;
    }

    if (category.description) {
        category.description = validator.escape(String(category.description));
        category.descriptionParsed = category.descriptionParsed || category.description;
    }
}
