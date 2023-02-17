/**
 * 所有的controller方法
 */
export type CrudMethod =
    | 'list'
    | 'detail'
    | 'delete'
    | 'deleteMulti'
    | 'restore'
    | 'restoreMulti'
    | 'create'
    | 'update';

/**
 * 路由方法的配置项
 */
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { Type } from '@nestjs/common';
import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { Configure } from '../core/Configure';

export interface CrudMethodOption {
    /**
     * 路由是否允许匿名访问
     */
    allowGuest?: boolean;
    /**
     * 路由方法的序列化选项，noGroup不传参，否则根据'id'+方法匹配来传参
     */
    serialize?: ClassTransformOptions | 'noGroup';
    /**
     * 装饰器hook
     */
    hook?: (target: Type<any>, method: string) => void
}

export interface CrudItem {
    name: CrudMethod;
    options?: CrudMethodOption;
}

export interface CrudOptions {
    id: string;
    /**
     * 启用的路由方法
     */
    enabled: Array<CrudMethod | CrudItem>;
    /**
     * 列表查询、创建、更新的Dto
     */
    dtos: {
        [key in 'query' | 'create' | 'update']?: any;
    };
}

// restful要素：api版本、app前缀、module、docs

/**
 * 单个app的路由项配置
 */
export interface RouteOption {
    /**
     * 路由模块名
     */
    name: string;
    /**
     * 路由前缀
     */
    path: string;
    /**
     * 加载的控制器
     */
    controllers: Type<any>[]
    /**
     * 路由表
     */
    children?: RouteOption[]
    /**
     * 路由对应的说明文档
     */
    doc?: ApiDocSource;
}

/**
 * tag配置对象
 */
interface TagOption {
    /**
     * 标签名
     */
    name: string;
    /**
     * 标签描述
     */
    description?: string;
    /**
     * 额外的配置，外链文档
     */
    externalDocs?: ExternalDocumentationObject;
}

/**
 * 每个app对应的文档配置：tag、每个路由的描述
 */
export interface ApiDocSource {
    /**
     * api文档标题
     */
    title?: string;
    /**
     * api文档描述
     */
    description?: string;
    /**
     * 是否启用JWT登陆验证
     */
    auth?: boolean;
    /**
     * api文档标签
     */
    tags?: (string | TagOption)[]
}


/**
 * 一个版本配置，可以配置不同的版本app
 */
export interface VersionOption extends ApiDocSource {
    /**
     * 路由配置
     */
    routes?: RouteOption[]
}

/**
 * rest模块配置：前缀、版本管理
 */
export interface ApiConfig extends ApiDocSource {
    /**
     * 分别指定应用和Open API的总前缀
     */
    prefix?: {
        route?: string;
        doc?: string;
    };
    /**
     * 默认版本
     */
    default: string;
    /**
     * 启用的版本
     * 默认版本不需要添加,如果是空数组则只启用默认版本
     */
    enabled: string[];
    /**
     * 所有版本的配置
     */
    versions: Record<string, VersionOption>;
}

// 每个app、version、rest模块配置都有title、description、auth

/**
 * swagger选项
 */
export interface SwaggerOption extends ApiDocSource {
    version: string;
    path: string;
    include: Type<any>[];
}

/**
 * API与swagger整合的选项
 * 默认api的文档与各个版本api的文档
 */
export interface APIDocOption {
    // version的配置
    default?: SwaggerOption;
    // 每个app的配置
    routes?: { [key: string]: SwaggerOption };
}

/**
 * 装饰器配置工厂
 */
export type CrudOptionsRegister = (configure: Configure) => CrudOptions | Promise<CrudOptions>