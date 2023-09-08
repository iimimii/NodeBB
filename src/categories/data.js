"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validator_1 = __importDefault(require("validator"));
const db = __importStar(require("../database"));
const meta = __importStar(require("../meta"));
const plugins = __importStar(require("../plugins"));
const utils = __importStar(require("../utils"));
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
const Categories = {
    getCategoriesFields: function (cids, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray(cids) || !cids.length) {
                return [];
            }
            const keys = cids.map(cid => `category:${cid}`);
            const categories = yield db.getObjects(keys, fields);
            const result = yield plugins.hooks.fire('filter:category.getFields', {
                cids: cids,
                categories: categories,
                fields: fields,
                keys: keys,
            });
            result.categories.forEach(category => modifyCategory(category, fields));
            return result.categories;
        });
    },
    getCategoryData: function (cid) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = 'desiredFields';
            const categories = yield Categories.getCategoriesFields([cid], fields);
            return categories && categories.length ? categories[0] : null;
        });
    },
    getCategoriesData: function (cids) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = 'desiredFields';
            return yield Categories.getCategoriesFields(cids, fields);
        });
    },
    getCategoryField: function (cid, field) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield Categories.getCategoryFields(cid, field);
            return category ? category[field] : null;
        });
    },
    getCategoryFields: function (cid, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield Categories.getCategoriesFields([cid], fields);
            return categories ? categories[0] : null;
        });
    },
    // getAllCategoryFields: async function (fields: string): Promise<Category[]> {
    //     const cids = await Categories.getAllCidsFromSet('categories:cid');
    //     return await Categories.getCategoriesFields(cids, fields);
    // },
    setCategoryField: function (cid, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.setObjectField(`category:${cid}`, field, value);
        });
    },
    incrementCategoryFieldBy: function (cid, field, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db.incrObjectFieldBy(`category:${cid}`, field, value);
        });
    },
};
// Export the Categories module
exports.default = Categories;
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
function defaultIntField(category, fields, fieldName, defaultField) {
    if (!fields.length || fields.includes(fieldName)) {
        const useDefault = !category.hasOwnProperty(fieldName) ||
            category[fieldName] === null ||
            category[fieldName] === '' ||
            !utils.isNumber(category[fieldName]);
        category[fieldName] = useDefault ? meta.config[defaultField] : category[fieldName];
    }
}
function modifyCategory(category, fields) {
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
            category[field] = validator_1.default.escape(String(category[field] || ''));
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
        category.description = validator_1.default.escape(String(category.description));
        category.descriptionParsed = category.descriptionParsed || category.description;
    }
}
