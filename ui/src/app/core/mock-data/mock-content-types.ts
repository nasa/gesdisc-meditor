import { ContentType, ContentTypeIcon } from '../models/content-type';
 
export const CONTENT_TYPES: ContentType[] = [
  { 
    name: 'Alerts', 
    description: 'Message to notify visitors of important information regarding data availability, site availability and performance issues.',
    icon: {
      name: 'fa-warning',
      color: '#FFC104'
    },
    count: 324
  },
  { 
    name: 'Docs', 
    description: 'Supporting documentation, information and publications related to data collections.',
    icon: {
      name: 'fa-file-text',
      color: '#00BFBF'
    },
    count: 153
  },
  {
    name: 'FAQs', 
    description: 'Answers to frequently asked questions.',
    icon: {
      name: 'fa-question',
      color: '#868146'
    },
    count: 90
  },
  {
    name: 'Glossary', 
    description: 'Definitions of terms to help in your understanding.',
    icon: {
      name: 'fa-info',
      color: '#5275ad'
    },
    count: 34
  },
  { 
    name: 'How-To\'s', 
    description: 'Step-by-step procedure which shows end users how to accomplish a task using tools and services available at the GES DISC as well as external tools and services. These tasks include searching and access data, exercising value-added services, visualizing data, and analyzing data.',
    icon: {
      name: 'i-howto',
      color: '#6d456e'
    },
    count: 189
  },
  {
    name: 'Images', 
    description: 'Images of interest to the science community.',
    icon: {
      name: 'fa-picture-o',
      color: '#454545'
    },
    count: 519
  },
  {
    name: 'News', 
    description: 'Articles of interest to the science community.',
    icon: {
      name: 'fa-newspaper-o',
      color: '#679EF5'
    },
    count: 201
  },
  {
    name: 'Tools', 
    description: 'Web-based applications and utilities for accessing, processing and visualizing data.',
    icon: {
      name: 'fa-wrench',
      color: '#5f8168'
    },
    count: 17
  }
];